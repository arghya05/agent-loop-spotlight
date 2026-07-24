import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EXTERNAL_AGENTS: Record<string, { title: string; url: string }> = {
  'customer-experience': { title: 'Customer Experience Agents', url: 'https://lifecycle-analyzer.store/auth' },
  'marketing': { title: 'Marketing & Campaign Agents', url: 'https://lifecycle-analyzer.info/' },
  'merchandising': { title: 'Merchandising Agents', url: 'https://lifecycle-analyzer.com/' },
  'workforce': { title: 'Workforce & HR Agents', url: 'https://lifecycle-analyzer.online/documents' },
  'finance': { title: 'Finance & Risk Agents', url: 'https://rebatewhisperer.com/' },
  'analytics': { title: 'Analytics & Insights Agents', url: 'https://mayarobinsongenie-3650405149511689.9.azure.databricksapps.com' },
  'support': { title: 'Support & Service Agents', url: 'https://finkloopais.live/' },
};

export const ExternalAgentPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const agent = agentId ? EXTERNAL_AGENTS[agentId] : undefined;

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Unknown agent area.</p>
        <Button onClick={() => navigate('/hub')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Super Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-black text-white shrink-0">
        <Button
          onClick={() => navigate('/hub')}
          variant="ghost"
          size="sm"
          className="text-zinc-300 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Super Agents
        </Button>
        <div className="text-sm font-medium truncate">{agent.title}</div>
        <a
          href={agent.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300"
        >
          Open in new tab <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>
      <iframe
        src={agent.url}
        title={agent.title}
        className="flex-1 w-full border-0 bg-white"
      />
    </div>
  );
};

export default ExternalAgentPage;
