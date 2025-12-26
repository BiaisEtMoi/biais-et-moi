export interface ResultData {
  block3Cond: string;
  feedback: string;
  logs: LogEntry[];
  d: string;
}

export interface LogEntry {
  log_serial: number;
  trial_id: number;
  name: string;
  responseHandle: string;
  latency: number;
  stimuli: string[];
  media: string[];
  data: {
    score: number;
    parcel: string;
    corResp: string;
    condition: string;
    block: number;
  };
}
