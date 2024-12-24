import { marked } from "marked";
import toast from "svelte-french-toast";
import { Agent, RichText, type AtpBaseClient } from "@atproto/api";
import { dev } from "$app/environment";
import type { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export async function renderTextToMarkdownToHTML(text: string, agent: Agent | AtpBaseClient) {
  const rt = new RichText({ text });
  await rt.detectFacets(agent);
  let markdown = "";
  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      markdown += `[${segment.text}](${segment.link?.uri})`
    } 
    else if (segment.isMention()) {
      let profile;
      if (agent instanceof Agent) {
        profile = await agent.getProfile({ actor: segment.mention?.did || "" });
      }
      else {
        profile = await agent.app.bsky.actor.getProfile({ actor: segment.mention?.did || "" });
      }
      markdown += `[${segment.text}](${dev ? "http://localhost:5173" : "https://myb.zeu.dev" }/p/${profile.data.handle})`
    } 
    else {
      markdown += segment.text
    }
  }

  const html = await marked.parse(markdown);
  return html;
}

export function getThreadRoot(thread: ThreadViewPost): { cid: string, uri: string } {
  if (thread.parent) {
    if (thread.parent?.parent) {
      getThreadRoot(thread.parent.parent as ThreadViewPost);
    }
    else {
      return {
        cid: (thread.parent.post as FeedViewPost).cid as string,
        uri: (thread.parent.post as FeedViewPost).uri as string
      }
    }
  }

  return {
    cid: thread.post.cid,
    uri: thread.post.uri
  }
}

export function toastComingSoon() {
  toast("Coming soon", {
    icon: "🙊" 
  });
}

export function toastSuccess(text: string) {
  toast(text, {
    icon: "🥳" 
  });
}

export function toastError(text: string) {
  toast(text, {
    icon: "🚨" 
  });
}
