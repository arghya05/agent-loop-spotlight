import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, Zap, Loader2, CheckCircle2, Square, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AutopilotStep {
  id: string;
  label: string;
  duration: number;
  /** Optional callback to generate activity log entries for this step. Return array of messages. */
  activities?: () => { message: string; type?: 'info' | 'action' | 'success' }[];
}

interface AutopilotPanelProps {
  steps: AutopilotStep[];
  queueCount: number;
  /** Label for the items being processed, e.g. "invoices", "contracts" */
  itemLabel: string;
  /** Triggered when autopilot completes — receives total processed */
  onComplete?: (processed: number) => void;
  title?: string;
}

export const AutopilotPanel = ({ steps, queueCount, itemLabel, onComplete, title = 'Autopilot' }: AutopilotPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [complete, setComplete] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [log, setLog] = useState<{ time: string; message: string; type: 'info' | 'action' | 'success' }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: 'info' | 'action' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog(prev => [...prev, { time, message, type }]);
  };

  useEffect(() => {
    if (isRunning && stepIdx < steps.length - 1) {
      const next = steps[stepIdx + 1];
      timerRef.current = setTimeout(() => {
        const nextIdx = stepIdx + 1;
        setStepIdx(nextIdx);
        const cfg = steps[nextIdx];
        if (cfg.activities) {
          const events = cfg.activities();
          events.forEach((e, i) => {
            setTimeout(() => addLog(e.message, e.type || 'info'), i * 200);
          });
          if (nextIdx >= steps.length - 2) {
            setProcessed(p => p + events.length);
          }
        }
        if (nextIdx === steps.length - 1) {
          setTimeout(() => {
            addLog(`Complete! Workflow finished successfully`, 'success');
            setIsRunning(false);
            setComplete(true);
            onComplete?.(queueCount);
          }, 400);
        }
      }, next?.duration || 1500);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [isRunning, stepIdx, steps, queueCount, onComplete]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [log]);

  const start = () => {
    setIsRunning(true);
    setStepIdx(-1);
    setComplete(false);
    setProcessed(0);
    setLog([]);
    addLog(`Autopilot initiated - processing ${queueCount} ${itemLabel}`, 'action');
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
  };

  const reset = () => { setComplete(false); setStepIdx(-1); setLog([]); setProcessed(0); };

  const progress = stepIdx >= 0 ? ((stepIdx + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        {!isRunning && !complete && (
          <Button onClick={start} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2">
            <Bot className="w-4 h-4" />
            <Zap className="w-3 h-3" />
            Run Autopilot
            <Badge variant="secondary" className="ml-1 bg-white/20 text-primary-foreground">{queueCount}</Badge>
          </Button>
        )}
        {isRunning && (
          <Button onClick={stop} variant="destructive" className="gap-2">
            <Square className="w-4 h-4" /> Stop
          </Button>
        )}
        {complete && (
          <Button onClick={reset} variant="outline" className="gap-2 border-status-success text-status-success">
            <CheckCircle2 className="w-4 h-4" /> Complete — Reset
          </Button>
        )}
      </div>

      {(isRunning || complete) && (
        <Card className={cn("card-elevated border-2 transition-all", isRunning && "border-primary/50 bg-primary/5", complete && "border-status-success/50 bg-status-success-bg")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isRunning ? "bg-primary text-primary-foreground" : "bg-status-success text-primary-foreground")}>
                {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground">{isRunning ? `${title} Running` : `${title} Complete`}</p>
                  <span className="text-sm text-muted-foreground">{processed} {itemLabel} processed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-border/50">
              {steps.map((step, i) => (
                <div key={step.id} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  stepIdx > i && "bg-status-success text-primary-foreground",
                  stepIdx === i && isRunning && "bg-primary text-primary-foreground animate-pulse",
                  stepIdx < i && "bg-muted text-muted-foreground")}>
                  {stepIdx > i ? <CheckCircle2 className="w-3 h-3" /> : stepIdx === i && isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="w-3 h-3 rounded-full bg-current opacity-30" />}
                  {step.label}
                </div>
              ))}
            </div>
            {(isRunning || log.length > 0) && (
              <div className="bg-background/50 rounded-lg border border-border/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Live Activity Feed
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{log.length} events</Badge>
                </div>
                <div ref={scrollRef} className="max-h-[160px] overflow-y-auto p-2 space-y-1">
                  {log.map((e, i) => (
                    <div key={i} className={cn("flex items-start gap-2 text-xs px-2 py-1 rounded",
                      e.type === 'success' ? 'bg-status-success/10' : e.type === 'action' ? 'bg-primary/5' : 'bg-transparent')}>
                      <span className="text-muted-foreground font-mono text-[10px] mt-0.5 shrink-0">{e.time}</span>
                      <span className={cn(e.type === 'success' ? 'text-status-success' : e.type === 'action' ? 'text-primary' : 'text-foreground')}>{e.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
