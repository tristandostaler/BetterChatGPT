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
      let results = [];

      if (!data?.items) return JSON.stringify([]);

      for (let i in data.items) {
        // console.log(data.items[i]);
        let image_links = [];
        for (let j in data.items[i].pagemap?.cse_image) {
          image_links.push(data.items[i].pagemap?.cse_image[j].src);
        }
        results.push({
          title: data.items[i].title,
          link: data.items[i].link,
          snippet: data.items[i].snippet,
          image_links: image_links,
        });
      }

      return JSON.stringify(results);

    } catch (error: any) {
      return await handleException(error, () => { return execute({ input }) })
    }
  }

  return new Tool(paramsSchema, name, description, execute).tool;
}

