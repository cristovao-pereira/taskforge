
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  objective: string;
  plan?: 'gratis' | 'construtor' | 'estrategico';
  preferences: {
    strategicMode: 'conservative' | 'balanced' | 'aggressive';
    deepMode: boolean;
    alertSensitivity: 'normal' | 'high';
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Decision {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'analyzing' | 'decided' | 'implemented' | 'active' | 'completed' | 'archived';
  riskLevel: 'low' | 'medium' | 'high';
  impactScore: number;
  type: 'quick' | 'deep' | 'Product' | 'Pricing' | 'Growth' | 'Hiring' | 'Strategy';
  summary: string;
  rationale?: string;
  outcome?: 'Positive' | 'Negative' | 'Neutral' | 'Pending';
  connections?: string[];
}

export interface Risk {
  id: string;
  title: string;
  type: 'strategic' | 'execution' | 'dependency' | 'timeline';
  origin: 'DecisionForge' | 'Execution Plans' | 'ClarityForge' | 'LeverageForge';
  relatedItem: string;
  level: 'low' | 'medium' | 'high';
  date: string;
  status: 'active' | 'mitigated' | 'monitoring' | 'resolved';
  description?: string;
}

export interface ExecutionPlan {
  id: string;
  title: string;
  origin: 'DecisionForge' | 'ClarityForge' | 'LeverageForge';
  date: string;
  status: 'planning' | 'active' | 'at_risk' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high';
  objective: string;
  timeline?: string;
  tasks?: Task[];
  phases?: Phase[];
  intelligence?: {
    risks: string[];
    dependencies: string[];
    impact: string;
    confidence: number;
    rationale?: string;
  };
}

export interface Phase {
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  assignee: string;
  deadline: string;
}

export interface StrategicSession {
  id: string;
  title: string;
  module: 'DecisionForge' | 'ClarityForge' | 'LeverageForge';
  mode: 'quick' | 'deep';
  date: string;
  status: 'active' | 'completed';
  summary: string;
  progress?: number;
}
