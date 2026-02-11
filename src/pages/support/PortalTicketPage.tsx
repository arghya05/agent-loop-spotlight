import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ticketsData from '@/data/support/tickets.json';
import { useSupportStore } from '@/store/supportStore';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, CheckCircle2, Clock, AlertTriangle, Bot, User,
  Shield, FileText, Loader2, ThumbsUp, ThumbsDown, Zap, MessageSquare,
  Key, UserPlus, ReceiptText, BarChart3, Bug, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  in_progress: 'bg-status-warning/10 text-status-warning',
  waiting_on_supplier: 'bg-blue-500/10 text-blue-500',
  waiting_on_it: 'bg-purple-500/10 text-purple-500',
  resolved: 'bg-status-success/10 text-status-success',
  closed: 'bg-muted text-muted-foreground',
};

interface ChatMessage {
  role: 'supplier' | 'agent' | 'system';
  content: string;
  time: string;
  options?: ChatOption[];
  actionCard?: ActionCard;
}

interface ChatOption {
  label: string;
  value: string;
  icon?: string;
}

interface ActionCard {
  action: string;
  target?: string;
  preconditions?: string;
  requiresApproval: boolean;
  status: 'pending' | 'executing' | 'success' | 'failed';
  evidence?: string;
}

type ConversationIntent =
  | 'login_access' | 'user_mgmt' | 'p2p_invoice'
  | 'reporting' | 'portal_bug' | 'unknown' | 'greeting';

interface ConversationState {
  intent: ConversationIntent;
  step: number;
  collectedInfo: Record<string, string>;
  resolved: boolean;
}

const QUICK_ACTIONS: ChatOption[] = [
  { label: "Can't login", value: "I can't log into my account", icon: 'key' },
  { label: "Reset password", value: "I need to reset my password", icon: 'shield' },
  { label: "Unlock account", value: "My account is locked out", icon: 'shield' },
  { label: "Create user", value: "I need to create a new portal user", icon: 'user-plus' },
  { label: "Invoice rejected", value: "My invoice was rejected and I don't understand why", icon: 'receipt' },
  { label: "Where's my payment?", value: "I want to check the status of my payment", icon: 'receipt' },
  { label: "Generate report", value: "I need to generate a report", icon: 'chart' },
  { label: "System error", value: "I'm getting an error on the portal", icon: 'bug' },
];

const getOptionIcon = (icon?: string) => {
  switch (icon) {
    case 'key': return <Key className="w-3 h-3" />;
    case 'shield': return <Shield className="w-3 h-3" />;
    case 'user-plus': return <UserPlus className="w-3 h-3" />;
    case 'receipt': return <ReceiptText className="w-3 h-3" />;
    case 'chart': return <BarChart3 className="w-3 h-3" />;
    case 'bug': return <Bug className="w-3 h-3" />;
    default: return <HelpCircle className="w-3 h-3" />;
  }
};

// Conversation flows keyed by intent + step
const conversationFlows: Record<string, (state: ConversationState, userMsg: string) => {
  response: string;
  options?: ChatOption[];
  actionCard?: ActionCard;
  nextStep: number;
  updatedInfo?: Record<string, string>;
  resolved?: boolean;
}> = {
  'login_access:0': (_s, msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('locked') || lower.includes('lock')) {
      return {
        response: "I can see your account may be locked. Let me check…\n\n🔍 I found your account (**priya@globaltextiles.com**). It was locked after 5 failed MFA attempts at 08:42 AM today.\n\nHow would you like to proceed?",
        options: [
          { label: "Unlock my account", value: "unlock" },
          { label: "Reset password too", value: "unlock_and_reset" },
          { label: "Check MFA status", value: "check_mfa" },
        ],
        nextStep: 1,
        updatedInfo: { issue: 'locked_account', email: 'priya@globaltextiles.com' },
      };
    }
    if (lower.includes('password') || lower.includes('reset')) {
      return {
        response: "I can help reset your password. First, let me verify your identity.\n\nCan you confirm the email address associated with your account?",
        nextStep: 1,
        updatedInfo: { issue: 'password_reset' },
      };
    }
    return {
      response: "I understand you're having login trouble. Could you tell me more about what's happening?\n\nFor example:",
      options: [
        { label: "Account is locked", value: "My account is locked out" },
        { label: "Forgot password", value: "I forgot my password and need to reset it" },
        { label: "MFA not working", value: "My MFA authenticator isn't working" },
        { label: "Getting an error", value: "I'm getting an error when I try to log in" },
      ],
      nextStep: 0,
    };
  },
  'login_access:1': (state, msg) => {
    const lower = msg.toLowerCase();
    if (state.collectedInfo.issue === 'password_reset') {
      if (lower.includes('@')) {
        return {
          response: `Got it — I found the account for **${msg.trim()}**. I'll send a password reset link now.`,
          actionCard: {
            action: 'Send Password Reset',
            target: msg.trim(),
            preconditions: 'Email verified in directory',
            requiresApproval: false,
            status: 'pending',
          },
          nextStep: 2,
          updatedInfo: { email: msg.trim() },
        };
      }
      return {
        response: "Could you provide your email address so I can look up your account?",
        nextStep: 1,
      };
    }
    // locked account flow
    if (lower.includes('unlock') && lower.includes('reset')) {
      return {
        response: "I'll unlock your account and send a password reset link. Let me execute both actions.",
        actionCard: {
          action: 'Unlock Account + Reset Password',
          target: state.collectedInfo.email || 'priya@globaltextiles.com',
          preconditions: 'Identity verified via session',
          requiresApproval: false,
          status: 'pending',
        },
        nextStep: 2,
      };
    }
    if (lower === 'unlock' || lower.includes('unlock')) {
      return {
        response: "I'll unlock your account right away.",
        actionCard: {
          action: 'Unlock Account',
          target: state.collectedInfo.email || 'priya@globaltextiles.com',
          preconditions: 'Identity verified via session',
          requiresApproval: false,
          status: 'pending',
        },
        nextStep: 2,
      };
    }
    if (lower.includes('mfa') || lower.includes('check')) {
      return {
        response: "Checking your MFA configuration…\n\n✅ MFA is enabled (TOTP via Google Authenticator)\n⚠️ Last successful MFA: 2 days ago\n❌ 5 failed attempts today\n\nIt looks like your authenticator app may be out of sync. Would you like me to:",
        options: [
          { label: "Reset MFA", value: "Please reset my MFA so I can set it up again" },
          { label: "Just unlock", value: "Just unlock my account, I'll try again" },
        ],
        nextStep: 1,
      };
    }
    return {
      response: "How would you like to proceed?",
      options: [
        { label: "Unlock account", value: "unlock" },
        { label: "Reset password", value: "Reset my password" },
        { label: "Talk to a human", value: "I'd like to speak to a support agent" },
      ],
      nextStep: 1,
    };
  },
  'login_access:2': () => ({
    response: "Is there anything else I can help you with regarding your account access?",
    options: [
      { label: "No, all good!", value: "No, that's all. Thank you!" },
      { label: "Yes, another issue", value: "Yes, I have another question" },
    ],
    nextStep: 3,
  }),

  'p2p_invoice:0': (_s, _msg) => ({
    response: "I'd like to help with your invoice issue. Could you provide the **invoice number** so I can pull up the details?\n\nOr if you're not sure, I can look up your recent invoices.",
    options: [
      { label: "Look up recent invoices", value: "Show me my recent invoices" },
      { label: "Check payment status", value: "I want to check payment status" },
    ],
    nextStep: 1,
  }),
  'p2p_invoice:1': (state, msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('recent') || lower.includes('look up')) {
      return {
        response: "Here are your most recent invoices:\n\n| Invoice | Amount | Status | Date |\n|---------|--------|--------|------|\n| INV-8842 | $12,450 | ❌ Rejected | Feb 8 |\n| INV-8801 | $8,200 | ✅ Approved | Feb 5 |\n| INV-8779 | $15,300 | ⏳ Pending | Feb 3 |\n\nWhich invoice do you need help with?",
        options: [
          { label: "INV-8842 (Rejected)", value: "Tell me why INV-8842 was rejected" },
          { label: "INV-8779 (Pending)", value: "What's the status of INV-8779?" },
        ],
        nextStep: 2,
        updatedInfo: { lookup: 'recent' },
      };
    }
    if (lower.includes('payment')) {
      return {
        response: "Let me check your payment status…\n\n💰 **Next scheduled payment**: Feb 14, 2025\n📋 **Invoices in payment run**: INV-8801 ($8,200)\n⏳ **Payment terms**: Net-30 from approval\n\nIs there a specific payment you're concerned about?",
        nextStep: 2,
        updatedInfo: { issue: 'payment_status' },
      };
    }
    // User provided an invoice number
    const invMatch = msg.match(/INV[-\s]?(\d+)/i);
    if (invMatch) {
      return {
        response: `Looking up **INV-${invMatch[1]}**…\n\n📄 **Invoice INV-${invMatch[1]}**\n- Amount: $12,450\n- Submitted: Feb 8, 2025\n- Status: **Rejected**\n- Reason: **Price mismatch** — invoiced unit price ($24.50) differs from contract price ($22.00) on 3 line items\n\nWould you like me to:`,
        options: [
          { label: "Explain in detail", value: "Show me which line items have the price mismatch" },
          { label: "Dispute this", value: "I want to dispute this rejection" },
          { label: "Resubmit corrected", value: "How do I resubmit a corrected invoice?" },
        ],
        nextStep: 2,
        updatedInfo: { invoiceId: `INV-${invMatch[1]}`, issue: 'rejected' },
      };
    }
    return {
      response: "Could you share the invoice number? It usually starts with **INV-** followed by digits (e.g., INV-8842).",
      nextStep: 1,
    };
  },
  'p2p_invoice:2': (state, msg) => {
    const lower = msg.toLowerCase();
    // Handle invoice number mention — show details about that invoice
    const invMatch = msg.match(/INV[-\s]?(\d+)/i);
    if (invMatch) {
      const invId = `INV-${invMatch[1]}`;
      if (invMatch[1] === '8842') {
        return {
          response: `📄 **Invoice ${invId}** — Details:\n\n- **Amount**: $12,450\n- **Submitted**: Feb 8, 2025\n- **Status**: ❌ **Rejected**\n- **Reason**: **Price mismatch** — invoiced unit price ($24.50) differs from contract price ($22.00) on 3 line items\n- **Contract**: CLM-2024-047\n- **PO**: PO-4521\n\n**Total overcharge**: $750 across 300 units\n\nWhat would you like to do?`,
          options: [
            { label: "See mismatched lines", value: "Show me which line items have the price mismatch" },
            { label: "Dispute this", value: "I want to dispute this rejection" },
            { label: "Resubmit corrected", value: "How do I resubmit a corrected invoice?" },
          ],
          nextStep: 2,
          updatedInfo: { invoiceId: invId, issue: 'rejected' },
        };
      }
      if (invMatch[1] === '8801') {
        return {
          response: `📄 **Invoice ${invId}** — Details:\n\n- **Amount**: $8,200\n- **Submitted**: Feb 5, 2025\n- **Status**: ✅ **Approved**\n- **Payment scheduled**: Feb 14, 2025\n- **Payment ref**: PAY-2025-0901\n\nThis invoice is fully approved and in the next payment run. Anything else?`,
          options: [
            { label: "No, thanks!", value: "No, that's all. Thank you!" },
            { label: "Another invoice", value: "I have a question about another invoice" },
          ],
          nextStep: 2,
        };
      }
      if (invMatch[1] === '8779') {
        return {
          response: `📄 **Invoice ${invId}** — Details:\n\n- **Amount**: $15,300\n- **Submitted**: Feb 3, 2025\n- **Status**: ⏳ **Pending Review**\n- **Assigned to**: AP Team (auto-matched to PO-4498)\n- **Expected decision**: Within 2 business days\n\nThe invoice is currently being validated against the PO. Anything else?`,
          options: [
            { label: "No, thanks!", value: "No, that's all. Thank you!" },
            { label: "Another invoice", value: "I have a question about another invoice" },
          ],
          nextStep: 2,
        };
      }
      return {
        response: `I looked up **${invId}** but couldn't find it in our system. Could you double-check the number? Your recent invoices are:\n\n| Invoice | Amount | Status |\n|---------|--------|--------|\n| INV-8842 | $12,450 | ❌ Rejected |\n| INV-8801 | $8,200 | ✅ Approved |\n| INV-8779 | $15,300 | ⏳ Pending |`,
        options: [
          { label: "INV-8842", value: "Tell me about INV-8842" },
          { label: "INV-8801", value: "Tell me about INV-8801" },
          { label: "INV-8779", value: "Tell me about INV-8779" },
        ],
        nextStep: 2,
      };
    }
    // Handle questions about the current invoice
    if (lower.includes('problem') || lower.includes('why') || lower.includes('reason') || lower.includes('what happened') || lower.includes('what is') || lower.includes('tell me') || lower.includes('explain') || lower.includes('status')) {
      const currentInv = state.collectedInfo.invoiceId || 'INV-8842';
      if (currentInv === 'INV-8842') {
        return {
          response: `Here's what happened with **${currentInv}**:\n\n❌ **Rejected** on Feb 8, 2025\n\n**Root cause**: Price mismatch on 3 line items\n- You invoiced SKU-A100 at **$24.50/unit**\n- The contract price (CLM-2024-047) is **$22.00/unit**\n- Overcharge: **$2.50/unit × 300 units = $750**\n\nThe system auto-rejected because the price variance exceeded the 1% tolerance threshold.\n\nWhat would you like to do?`,
          options: [
            { label: "See line items", value: "Show me which line items have the price mismatch" },
            { label: "Dispute this", value: "I want to dispute this rejection" },
            { label: "Resubmit corrected", value: "How do I resubmit a corrected invoice?" },
          ],
          nextStep: 2,
        };
      }
      return {
        response: `Could you tell me which invoice you'd like details about?`,
        options: [
          { label: "INV-8842 (Rejected)", value: "Tell me about INV-8842" },
          { label: "INV-8801 (Approved)", value: "Tell me about INV-8801" },
          { label: "INV-8779 (Pending)", value: "Tell me about INV-8779" },
        ],
        nextStep: 2,
      };
    }
    if (lower.includes('dispute')) {
      return {
        response: "I can create a dispute case for you. I'll include the price mismatch evidence automatically.\n\n📝 **Dispute Draft**:\n- Invoice: INV-8842\n- Reason: Price variance — contract allows $22.00, invoiced at $24.50\n- Supporting docs: Contract CLM-2024-047, PO PO-4521\n\nShall I submit this dispute?",
        actionCard: {
          action: 'Create Invoice Dispute',
          target: 'INV-8842',
          preconditions: 'Contract evidence attached',
          requiresApproval: false,
          status: 'pending',
        },
        nextStep: 3,
      };
    }
    if (lower.includes('detail') || lower.includes('line item') || lower.includes('which') || lower.includes('mismatch')) {
      return {
        response: "Here are the mismatched line items:\n\n| Line | SKU | Contract Price | Invoiced Price | Diff |\n|------|-----|---------------|----------------|------|\n| 3 | SKU-A100 | $22.00 | $24.50 | +$2.50 |\n| 7 | SKU-A100 | $22.00 | $24.50 | +$2.50 |\n| 12 | SKU-A100 | $22.00 | $24.50 | +$2.50 |\n\n**Total overcharge**: $750 across 300 units\n\nThe contract price of $22.00 is from **Contract CLM-2024-047** (effective Jan 1 – Dec 31, 2025).\n\nWhat would you like to do?",
        options: [
          { label: "Dispute rejection", value: "I want to dispute this rejection" },
          { label: "Resubmit corrected", value: "How do I resubmit a corrected invoice?" },
          { label: "That's helpful, thanks", value: "That explains it, thank you" },
        ],
        nextStep: 2,
      };
    }
    if (lower.includes('resubmit') || lower.includes('correct')) {
      return {
        response: "To resubmit a corrected invoice:\n\n1. Go to **Orders & Invoices** → find the original PO\n2. Click **Create Invoice** → the system will pre-fill from the PO\n3. Ensure unit prices match the contract ($22.00 for SKU-A100)\n4. Submit — it will link to the original PO automatically\n\n💡 **Tip**: The portal now shows contract prices next to each line item to help avoid mismatches.\n\nNeed anything else?",
        options: [
          { label: "No, that's all", value: "No, that's all. Thank you!" },
          { label: "Another question", value: "Yes, I have another question" },
        ],
        nextStep: 3,
      };
    }
    // Handle thanks/gratitude
    if (lower.includes('thank') || lower.includes('explains') || lower.includes('helpful') || lower.includes('got it') || lower.includes('i see')) {
      return {
        response: "You're welcome! Is there anything else I can help you with?",
        options: [
          { label: "No, all done", value: "No, that's all. Thank you!" },
          { label: "Yes, another issue", value: "Yes, I have another question" },
        ],
        nextStep: 3,
      };
    }
    return {
      response: "I can help you further with this invoice. What would you like to know?",
      options: [
        { label: "Why was it rejected?", value: "Why was INV-8842 rejected?" },
        { label: "See line items", value: "Show me which line items have the price mismatch" },
        { label: "Dispute it", value: "I want to dispute this rejection" },
        { label: "Resubmit corrected", value: "How do I resubmit a corrected invoice?" },
        { label: "No, I'm done", value: "No, that's all. Thank you!" },
      ],
      nextStep: 2,
    };
  },

  'user_mgmt:0': () => ({
    response: "I can help manage portal users. What do you need?",
    options: [
      { label: "Create new user", value: "I need to create a new portal user" },
      { label: "Reset someone's password", value: "I need to reset another user's password" },
      { label: "Change a user's role", value: "I need to change a user's role" },
      { label: "Deactivate a user", value: "I need to deactivate a user account" },
    ],
    nextStep: 1,
  }),
  'user_mgmt:1': (_s, msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('create') || lower.includes('new')) {
      return {
        response: "To create a new portal user, I'll need a few details:\n\n1. **Full name** of the new user\n2. **Email address**\n3. **Role**: Admin, Finance, or Viewer\n\nPlease share the name and email to get started.",
        nextStep: 2,
        updatedInfo: { action: 'create_user' },
      };
    }
    if (lower.includes('reset') || lower.includes('password')) {
      return {
        response: "Which user's password needs to be reset? Please provide their **email address**.",
        nextStep: 2,
        updatedInfo: { action: 'reset_password' },
      };
    }
    if (lower.includes('deactivat')) {
      return {
        response: "⚠️ Deactivating a user will revoke their portal access immediately. Which user do you want to deactivate? Please provide their **email address**.",
        nextStep: 2,
        updatedInfo: { action: 'deactivate_user' },
      };
    }
    return {
      response: "Could you tell me which user management action you need?",
      options: [
        { label: "Create user", value: "Create a new user" },
        { label: "Reset password", value: "Reset a user's password" },
        { label: "Deactivate user", value: "Deactivate a user" },
      ],
      nextStep: 1,
    };
  },
  'user_mgmt:2': (state, msg) => {
    if (state.collectedInfo.action === 'create_user') {
      const emailMatch = msg.match(/[\w.-]+@[\w.-]+/);
      const name = msg.replace(emailMatch?.[0] || '', '').trim().replace(/^,?\s*/, '').replace(/,?\s*$/, '') || 'New User';
      if (emailMatch) {
        return {
          response: `Great, I'll prepare the user creation:\n\n👤 **${name}**\n📧 ${emailMatch[0]}\n\nWhat role should this user have?`,
          options: [
            { label: "Admin", value: "Admin role" },
            { label: "Finance", value: "Finance role" },
            { label: "Viewer", value: "Viewer role" },
          ],
          nextStep: 3,
          updatedInfo: { userName: name, userEmail: emailMatch[0] },
        };
      }
      return {
        response: "Could you provide both the **full name** and **email address**? For example:\n\n*Rahul Sharma, rahul@company.com*",
        nextStep: 2,
      };
    }
    // reset or deactivate
    const emailMatch = msg.match(/[\w.-]+@[\w.-]+/);
    if (emailMatch) {
      const action = state.collectedInfo.action === 'deactivate_user' ? 'Deactivate User' : 'Reset User Password';
      return {
        response: `I'll ${action.toLowerCase()} for **${emailMatch[0]}**.`,
        actionCard: {
          action,
          target: emailMatch[0],
          preconditions: state.collectedInfo.action === 'deactivate_user' ? 'Requires supplier admin approval' : 'Identity verified',
          requiresApproval: state.collectedInfo.action === 'deactivate_user',
          status: 'pending',
        },
        nextStep: 4,
        updatedInfo: { userEmail: emailMatch[0] },
      };
    }
    return {
      response: "Please provide the user's **email address**.",
      nextStep: 2,
    };
  },
  'user_mgmt:3': (state, msg) => {
    const role = msg.toLowerCase().includes('admin') ? 'Admin' : msg.toLowerCase().includes('finance') ? 'Finance' : 'Viewer';
    return {
      response: `Ready to create the user:\n\n👤 **${state.collectedInfo.userName}**\n📧 ${state.collectedInfo.userEmail}\n🔑 Role: **${role}**\n\nThis requires **admin approval**. Shall I submit the request?`,
      actionCard: {
        action: 'Create Portal User',
        target: `${state.collectedInfo.userName} (${state.collectedInfo.userEmail}) — ${role}`,
        preconditions: 'Requires supplier admin approval',
        requiresApproval: true,
        status: 'pending',
      },
      nextStep: 4,
      updatedInfo: { role },
    };
  },

  'reporting:0': () => ({
    response: "I can generate reports for you! What type of report do you need?",
    options: [
      { label: "PO Summary", value: "Generate a PO Summary report" },
      { label: "Invoice Status", value: "Generate an Invoice Status report" },
      { label: "Payment History", value: "Generate a Payment History report" },
    ],
    nextStep: 1,
  }),
  'reporting:1': (_s, msg) => {
    const lower = msg.toLowerCase();
    const reportType = lower.includes('po') ? 'PO Summary' : lower.includes('invoice') ? 'Invoice Status' : lower.includes('payment') ? 'Payment History' : 'PO Summary';
    return {
      response: `I'll generate a **${reportType}** report. What date range?`,
      options: [
        { label: "Last 30 days", value: "Last 30 days" },
        { label: "Last quarter", value: "Last quarter" },
        { label: "Year to date", value: "Year to date" },
        { label: "Custom range", value: "I want to specify custom dates" },
      ],
      nextStep: 2,
      updatedInfo: { reportType },
    };
  },
  'reporting:2': (state, msg) => {
    const dateRange = msg;
    return {
      response: `Almost ready! What format would you prefer?`,
      options: [
        { label: "PDF", value: "PDF format" },
        { label: "Excel", value: "Excel format" },
      ],
      nextStep: 3,
      updatedInfo: { dateRange },
    };
  },
  'reporting:3': (state, msg) => {
    const format = msg.toLowerCase().includes('excel') ? 'Excel' : 'PDF';
    return {
      response: `Generating your report now…\n\n📊 **${state.collectedInfo.reportType}**\n📅 ${state.collectedInfo.dateRange}\n📄 Format: ${format}`,
      actionCard: {
        action: 'Generate Report',
        target: `${state.collectedInfo.reportType} — ${state.collectedInfo.dateRange} (${format})`,
        requiresApproval: false,
        status: 'pending',
      },
      nextStep: 4,
    };
  },

  'portal_bug:0': () => ({
    response: "I'm sorry you're experiencing issues. Can you describe what's happening?\n\nFor example: what page were you on, what action did you try, and what error did you see?",
    nextStep: 1,
  }),
  'portal_bug:1': (_s, msg) => ({
    response: `Thanks for the details. Let me check our recent system logs…\n\n🔍 **Findings:**\n- Portal version: 4.2.1 (current)\n- Your session: active, no errors in last hour\n- Known issues: ⚠️ File upload intermittently fails for files > 5MB (patch scheduled Feb 15)\n\nDoes this match what you experienced?`,
    options: [
      { label: "Yes, that's it", value: "Yes, that's the issue I'm seeing" },
      { label: "No, different issue", value: "No, my issue is different" },
      { label: "Escalate to IT", value: "Please escalate this to your IT team" },
    ],
    nextStep: 2,
    updatedInfo: { description: msg },
  }),
  'portal_bug:2': (_s, msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('yes') || lower.includes("that's it")) {
      return {
        response: "Good news — this is a known issue and a fix is scheduled for **Feb 15**.\n\n**Workaround**: Try compressing your file below 5MB, or split it into multiple uploads.\n\nI'll set a reminder to follow up with you after the patch is deployed. Anything else?",
        options: [
          { label: "No, thanks!", value: "No, that's all. Thank you!" },
          { label: "Another issue", value: "Yes, I have another question" },
        ],
        nextStep: 3,
      };
    }
    if (lower.includes('escalat') || lower.includes('it team')) {
      return {
        response: "I'll create a ticket with our IT team and include your session details and error context automatically.",
        actionCard: {
          action: 'Create IT Escalation Ticket',
          target: 'IT Support — Portal Bug',
          preconditions: 'Session logs and error context attached',
          requiresApproval: false,
          status: 'pending',
        },
        nextStep: 3,
      };
    }
    return {
      response: "Could you provide more details about the error? A screenshot or error message would be very helpful. In the meantime, would you like me to escalate to IT?",
      options: [
        { label: "Escalate to IT", value: "Please escalate this to your IT team" },
        { label: "Let me try again first", value: "I'll try again and come back if it persists" },
      ],
      nextStep: 2,
    };
  },
};

function classifyIntent(msg: string): ConversationIntent {
  const lower = msg.toLowerCase();
  if (lower.includes('login') || lower.includes('password') || lower.includes('locked') || lower.includes('lock') || lower.includes('mfa') || lower.includes("can't log") || lower.includes('access')) return 'login_access';
  if (lower.includes('create user') || lower.includes('new user') || lower.includes('deactivat') || lower.includes('user role') || lower.includes('user management')) return 'user_mgmt';
  if (lower.includes('invoice') || lower.includes('rejected') || lower.includes('payment') || lower.includes('po ') || lower.includes('purchase order')) return 'p2p_invoice';
  if (lower.includes('report') || lower.includes('export') || lower.includes('download')) return 'reporting';
  if (lower.includes('error') || lower.includes('bug') || lower.includes('crash') || lower.includes('broken') || lower.includes('not working') || lower.includes("doesn't work")) return 'portal_bug';
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) return 'greeting';
  return 'unknown';
}

export const PortalTicketPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addAuditEntry } = useSupportStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isNew = ticketId === 'new';
  const intentState = location.state as any;
  const existingTicket = !isNew ? (ticketsData as any[]).find(t => t.id === ticketId) : null;

  const [messages, setMessages] = useState<ChatMessage[]>(
    existingTicket?.conversation?.map((c: any) => ({ ...c, options: undefined, actionCard: undefined })) ||
    []
  );
  const [ticketStatus, setTicketStatus] = useState(existingTicket?.status || 'new');
  const [actions, setActions] = useState<any[]>(existingTicket?.actionsExecuted || []);
  const [showResolution, setShowResolution] = useState(false);
  const [convState, setConvState] = useState<ConversationState>({
    intent: 'unknown',
    step: 0,
    collectedInfo: {},
    resolved: false,
  });
  const [showQuickActions, setShowQuickActions] = useState(!existingTicket && !intentState?.label);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting or intent-based start
  useEffect(() => {
    if (messages.length === 0 && !existingTicket) {
      if (intentState?.label) {
        // User came from a quick action on portal home
        const userMsg = intentState.label;
        setMessages([{ role: 'supplier', content: userMsg, time: new Date().toISOString() }]);
        processMessage(userMsg);
      } else {
        // Fresh ticket — show greeting
        const greeting: ChatMessage = {
          role: 'agent',
          content: "👋 Hi! I'm your support agent. I can help with login issues, invoice questions, user management, reports, and more.\n\nWhat can I help you with today?",
          time: new Date().toISOString(),
        };
        setMessages([greeting]);
        setShowQuickActions(true);
      }
    }
  }, []);

  const processMessage = useCallback(async (userMsg: string) => {
    setIsTyping(true);
    setShowQuickActions(false);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    let currentIntent = convState.intent;
    let currentStep = convState.step;
    let currentInfo = { ...convState.collectedInfo };

    // If intent is unknown/greeting or user starts a new topic, re-classify
    if (currentIntent === 'unknown' || currentIntent === 'greeting') {
      currentIntent = classifyIntent(userMsg);
      currentStep = 0;
      currentInfo = {};
    }

    // Handle greetings
    if (currentIntent === 'greeting') {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "Hello! 😊 I'm here to help. What do you need assistance with?",
        time: new Date().toISOString(),
      }]);
      setShowQuickActions(true);
      setIsTyping(false);
      return;
    }

    // Handle unknown
    if (currentIntent === 'unknown') {
      // Try to still be helpful
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "I want to make sure I help you with the right thing. Could you pick one of these categories, or describe your issue in more detail?",
        time: new Date().toISOString(),
        options: [
          { label: "Login / Access issue", value: "I have a login problem" },
          { label: "Invoice / Payment", value: "I have an invoice question" },
          { label: "User management", value: "I need help managing users" },
          { label: "Generate a report", value: "I need to generate a report" },
          { label: "Technical problem", value: "I'm experiencing a technical issue" },
        ],
      }]);
      setConvState({ intent: 'unknown', step: 0, collectedInfo: {}, resolved: false });
      setIsTyping(false);
      return;
    }

    // Check for "thank you" / "that's all" / "no" at any point
    const lower = userMsg.toLowerCase();
    if (lower.includes("that's all") || lower.includes("no, that") || lower.includes("no thank") || (lower === 'no' && currentStep > 1)) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "Great, glad I could help! 🎉 Don't hesitate to reach out if you need anything else. Have a wonderful day!",
        time: new Date().toISOString(),
      }]);
      setTicketStatus('resolved');
      setShowResolution(true);
      setIsTyping(false);
      return;
    }

    if (lower.includes('another question') || lower.includes('another issue') || lower === 'yes') {
      setConvState({ intent: 'unknown', step: 0, collectedInfo: {}, resolved: false });
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "Of course! What else can I help you with?",
        time: new Date().toISOString(),
      }]);
      setShowQuickActions(true);
      setIsTyping(false);
      return;
    }

    setTicketStatus('in_progress');

    // Look up conversation flow
    const flowKey = `${currentIntent}:${currentStep}`;
    const flowFn = conversationFlows[flowKey];

    if (flowFn) {
      const state: ConversationState = { intent: currentIntent, step: currentStep, collectedInfo: currentInfo, resolved: false };
      const result = flowFn(state, userMsg);

      const newMsg: ChatMessage = {
        role: 'agent',
        content: result.response,
        time: new Date().toISOString(),
        options: result.options,
        actionCard: result.actionCard,
      };

      setMessages(prev => [...prev, newMsg]);
      setConvState({
        intent: currentIntent,
        step: result.nextStep,
        collectedInfo: { ...currentInfo, ...result.updatedInfo },
        resolved: result.resolved || false,
      });
    } else {
      // Smart fallback: try to re-classify intent from the message
      const reclassified = classifyIntent(userMsg);
      if (reclassified !== 'unknown' && reclassified !== 'greeting') {
        // Restart with new intent
        const newFlowKey = `${reclassified}:0`;
        const newFlowFn = conversationFlows[newFlowKey];
        if (newFlowFn) {
          const newState: ConversationState = { intent: reclassified, step: 0, collectedInfo: {}, resolved: false };
          const result = newFlowFn(newState, userMsg);
          setMessages(prev => [...prev, {
            role: 'agent',
            content: result.response,
            time: new Date().toISOString(),
            options: result.options,
            actionCard: result.actionCard,
          }]);
          setConvState({
            intent: reclassified,
            step: result.nextStep,
            collectedInfo: { ...result.updatedInfo },
            resolved: false,
          });
          setIsTyping(false);
          return;
        }
      }
      // True fallback — try to be helpful
      setMessages(prev => [...prev, {
        role: 'agent',
        content: "I want to make sure I understand correctly. Could you rephrase your question, or pick from one of these common topics?",
        time: new Date().toISOString(),
        options: [
          { label: "Login / Access issue", value: "I have a login problem" },
          { label: "Invoice / Payment", value: "I have an invoice question" },
          { label: "User management", value: "I need help managing users" },
          { label: "Generate a report", value: "I need to generate a report" },
          { label: "Technical problem", value: "I'm experiencing a technical issue" },
        ],
      }]);
      setConvState({ intent: 'unknown', step: 0, collectedInfo: {}, resolved: false });
    }

    setIsTyping(false);
  }, [convState]);

  const handleSend = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'supplier', content: userMsg, time: new Date().toISOString() }]);
    await processMessage(userMsg);
  };

  const handleOptionClick = (option: ChatOption) => {
    handleSend(option.value);
  };

  const handleQuickAction = (action: ChatOption) => {
    setShowQuickActions(false);
    handleSend(action.value);
  };

  const handleExecuteAction = (actionCard: ActionCard) => {
    // Update the message's action card to show executing
    setMessages(prev => prev.map((msg, i) => {
      if (msg.actionCard && msg.actionCard.action === actionCard.action && msg.actionCard.status === 'pending') {
        return { ...msg, actionCard: { ...msg.actionCard, status: 'executing' as const } };
      }
      return msg;
    }));

    setTimeout(() => {
      // Mark as success
      setMessages(prev => prev.map(msg => {
        if (msg.actionCard && msg.actionCard.action === actionCard.action && msg.actionCard.status === 'executing') {
          return { ...msg, actionCard: { ...msg.actionCard, status: 'success' as const, evidence: `${actionCard.action} completed successfully at ${new Date().toLocaleTimeString()}` } };
        }
        return msg;
      }));

      const newAction = { actionName: actionCard.action, status: 'success', time: new Date().toISOString(), evidence: `${actionCard.action} completed successfully` };
      setActions(prev => [...prev, newAction]);
      addAuditEntry({ actor: 'Agent', event: actionCard.action, details: `Executed for ticket ${ticketId}` });
      toast.success(`${actionCard.action} completed`);

      // Agent follow-up
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `✅ **${actionCard.action}** completed successfully!\n\nIs there anything else you need help with?`,
          time: new Date().toISOString(),
          options: [
            { label: "No, all done!", value: "No, that's all. Thank you!" },
            { label: "Yes, another issue", value: "Yes, I have another question" },
          ],
        }]);
        setShowResolution(true);
      }, 500);
    }, 1500);
  };

  const handleConfirmResolution = (confirmed: boolean) => {
    if (confirmed) {
      setTicketStatus('closed');
      setMessages(prev => [...prev, { role: 'agent', content: '🎉 Wonderful! I\'m glad everything is sorted. This ticket is now closed. Feel free to open a new request anytime you need help!', time: new Date().toISOString() }]);
      addAuditEntry({ actor: 'Supplier', event: 'Resolution confirmed', details: `Ticket ${ticketId} closed` });
      toast.success('Ticket closed — issue resolved');
      setShowResolution(false);
    } else {
      setMessages(prev => [...prev, { role: 'agent', content: 'I\'m sorry it\'s not fully resolved. What\'s still not working? I\'ll dig deeper.', time: new Date().toISOString() }]);
      setTicketStatus('in_progress');
      setShowResolution(false);
      setConvState(prev => ({ ...prev, intent: 'unknown', step: 0 }));
    }
  };

  const ticket = existingTicket || { id: ticketId === 'new' ? 'TKT-NEW' : ticketId, summary: intentState?.label || 'New Support Request', priority: 'med', intentCategory: intentState?.intent || 'unknown', contextSignals: [], delegations: [] };

  return (
    <div className="p-4 h-[calc(100vh-120px)]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/support/portal')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">{ticket.summary}</h1>
          <p className="text-xs text-muted-foreground">{ticket.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-60px)]">
        {/* Chat Panel */}
        <div className="col-span-7 flex flex-col border border-border rounded-xl overflow-hidden bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={cn("flex gap-3", msg.role === 'supplier' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === 'supplier'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn("text-[10px] mt-1", msg.role === 'supplier' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'supplier' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Interactive Options */}
                {msg.options && msg.options.length > 0 && i === messages.length - 1 && (
                  <div className="ml-11 mt-2 flex flex-wrap gap-2">
                    {msg.options.map((opt, j) => (
                      <Button
                        key={j}
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-3 text-xs rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Action Card */}
                {msg.actionCard && (
                  <div className="ml-11 mt-3">
                    <div className={cn(
                      "border rounded-xl p-3 space-y-2 text-sm transition-all",
                      msg.actionCard.status === 'success' ? 'border-status-success/30 bg-status-success/5' :
                      msg.actionCard.status === 'executing' ? 'border-status-warning/30 bg-status-warning/5' :
                      'border-primary/20 bg-primary/5'
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-medium text-xs">{msg.actionCard.action}</span>
                        </div>
                        <Badge className={cn("text-[10px]",
                          msg.actionCard.status === 'success' ? 'bg-status-success/10 text-status-success' :
                          msg.actionCard.status === 'executing' ? 'bg-status-warning/10 text-status-warning' :
                          'bg-primary/10 text-primary'
                        )}>
                          {msg.actionCard.status === 'executing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          {msg.actionCard.status === 'success' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {msg.actionCard.status}
                        </Badge>
                      </div>
                      {msg.actionCard.target && (
                        <p className="text-xs text-muted-foreground">Target: <span className="text-foreground">{msg.actionCard.target}</span></p>
                      )}
                      {msg.actionCard.preconditions && (
                        <p className="text-xs text-muted-foreground">Pre-check: {msg.actionCard.preconditions}</p>
                      )}
                      {msg.actionCard.evidence && (
                        <p className="text-xs text-status-success">{msg.actionCard.evidence}</p>
                      )}
                      {msg.actionCard.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleExecuteAction(msg.actionCard!)}>
                            {msg.actionCard.requiresApproval ? '🔒 Request Approval & Execute' : '▶ Execute'}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {
                            setMessages(prev => [...prev, { role: 'supplier', content: "I'd rather not do this right now.", time: new Date().toISOString() }]);
                            processMessage("I'd rather not do this right now.");
                          }}>
                            Skip
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Quick Actions (shown at start) */}
            {showQuickActions && !isTyping && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground ml-11">Quick actions:</p>
                <div className="ml-11 grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 text-xs justify-start gap-2 rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all"
                      onClick={() => handleQuickAction(action)}
                    >
                      {getOptionIcon(action.icon)}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Confirmation */}
            {showResolution && ticketStatus !== 'closed' && (
              <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-status-success" />
                  <p className="font-medium text-sm">Is your issue resolved?</p>
                </div>
                {actions.length > 0 && (
                  <p className="text-xs text-muted-foreground">Actions taken: {actions.map(a => a.actionName).join(', ')}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="bg-status-success hover:bg-status-success/90" onClick={() => handleConfirmResolution(true)}>
                    <ThumbsUp className="w-3 h-3 mr-1" />Yes, resolved!
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleConfirmResolution(false)}>
                    <ThumbsDown className="w-3 h-3 mr-1" />Not yet
                  </Button>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                placeholder={ticketStatus === 'closed' ? 'Ticket closed' : 'Type your message...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={ticketStatus === 'closed' || isTyping}
              />
              <Button onClick={() => handleSend()} disabled={!input.trim() || ticketStatus === 'closed' || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Case Sidebar */}
        <div className="col-span-5 space-y-4 overflow-y-auto">
          {/* Status */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ticket Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                <Badge className={cn("text-[10px]", statusColors[ticketStatus])}>{ticketStatus.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span>
                <Badge variant={ticket.priority === 'critical' ? 'destructive' : 'outline'}>{ticket.priority}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span>
                <Badge variant="secondary" className="text-[10px]">
                  {convState.intent !== 'unknown' ? convState.intent.replace(/_/g, ' ') : ticket.intentCategory?.replace(/_/g, ' ')}
                </Badge>
              </div>
              {convState.intent !== 'unknown' && convState.intent !== 'greeting' && (
                <div className="flex justify-between"><span className="text-muted-foreground">Detected intent</span>
                  <span className="text-xs font-medium text-primary">{convState.intent.replace(/_/g, ' ')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collected Info */}
          {Object.keys(convState.collectedInfo).length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />Collected Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(convState.collectedInfo).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs p-1.5">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium max-w-[60%] text-right truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions Taken */}
          {actions.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />Actions Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-status-success/5">
                      <CheckCircle2 className="w-3 h-3 text-status-success" />
                      <div>
                        <p className="text-xs font-medium">{a.actionName}</p>
                        <p className="text-[10px] text-muted-foreground">{a.evidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context Signals */}
          {existingTicket?.contextSignals?.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Context Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {existingTicket.contextSignals.map((sig: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs p-1.5">
                      <span className="text-muted-foreground">{sig.source}: {sig.key}</span>
                      <span className="font-medium">{sig.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delegations */}
          {existingTicket?.delegations?.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warning" />Escalations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {existingTicket.delegations.map((d: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg border border-border text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">System</span><span>{d.system}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ref</span><span className="font-medium">{d.ticketRef}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="text-[10px]">{d.status}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
