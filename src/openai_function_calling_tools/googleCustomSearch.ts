import { Tool } from './tool';
import { z } from 'zod';
import useLoginAppWrite from '@hooks/AppWriteAPI/useLogin';
import { account, invokeCSEFunction } from "@hooks/AppWriteAPI/client"
import { md5Hash } from '@utils/hash';
import useLocalStore from '@store/store';
import { AppwriteException, ID } from 'appwrite';
import { email, handleException, password } from './appwrite';


export function createGoogleCustomSearch() {
  const paramsSchema = z.object({
    input: z.string(),
  });
  const name = 'googleCustomSearch';
  const description = `A custom search engine, like google. 
  Useful for when you need to answer questions about current events. 
  This can also be used to search for images.
  Input should be a search query. Outputs a JSON array of results.`;

  async function execute({ input }: z.infer<typeof paramsSchema>): Promise<string> {
    try {
      const res = await invokeCSEFunction(JSON.stringify({ type: "cse", query: input }));

      if (res.statusCode != 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = JSON.parse(res.response);

      const results = data.items?.map((item: { title?: string; link?: string; snippet?: string; pagemap?: { cse_image?: [{ src?: string; }]; }; }) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image_links: item.pagemap?.cse_image?.map(i => i.src ?? ""),
      })) ?? [];
      return JSON.stringify(results);

    } catch (error: any) {
      return await handleException(error, () => { return execute({ input }) })
    }
  }

  return new Tool(paramsSchema, name, description, execute).tool;
}

