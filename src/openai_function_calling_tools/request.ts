import { Tool } from './tool';
import { z } from 'zod';
import { fetchNoCors } from "@openai_function_calling_tools/fetch-no-cors"
import { htmlToText } from 'html-to-text';

const options = {
  wordwrap: 130,
  baseElements: {
    selectors: ['body']
  }
};

export function createRequest(baseOption: {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, any>;
  headers?: Record<string, string>;
} = {}) {
  const paramsSchema = z.object({
    url: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    body: z.record(z.any()).optional(),
    headers: z.record(z.string()).optional(),
  });
  const name = 'request';
  const description = `Useful for sending http request that do not require authentication or api key.
Use this when you need to get specific content from a url that do not require authentication or api key.
Input is a url, method, body, headers, output is the result of the request.

Restrictions:
- Do not use any of the following domain:
  - news.google.com
`;

  const execute = async ({ url, method, body, headers }: z.infer<typeof paramsSchema>) => {
    try {
      const res = await fetchNoCors(url || baseOption.url!, {
        method: method || baseOption.method!,
        body: JSON.stringify(body || baseOption.body),
        headers: headers || baseOption.headers,
      });

      // if (!res.ok) {
      //   throw new Error(`HTTP error! status: ${res.status} ${res.statusText} ${htmlToText(await res.text(), options).substring(0, 200)}`);
      // }

      return res;
    } catch (error) {
      // console.log("Error in requests: " + error)
      throw error;
    }
  };

  return new Tool<typeof paramsSchema, z.ZodType<Promise<string>, any>>(paramsSchema, name, description, execute).tool;
}

