export interface EventSourceDataInterface {
  choices: EventSourceDataChoices[];
  created: number;
  id: string;
  model: string;
  object: string;
}

export type EventSourceData = EventSourceDataInterface | '[DONE]';

export interface EventSourceDataChoices {
  delta?: {
    content?: string;
    function_call?: {
      name: string;
      arguments: string;
    }
    role?: string;
  };
  message?: {
    role: string;
    content: string;
    refusal?: {};
  }
  finish_reason?: string;
  index: number;
}

export interface ShareGPTSubmitBodyInterface {
  avatarUrl: string;
  items: {
    from: 'gpt' | 'human';
    value: string;
  }[];
}
