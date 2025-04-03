import { marked } from "marked";
import { dev } from "$app/environment";
import toast from "svelte-french-toast";
import { Agent, RichText, type AtpBaseClient } from "@atproto/api";
import type { FeedViewPost, ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export const DISCOVERY_FEED_ITEM = {
	value: "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot",
	label: "Discovery"
};

export const FOLLOWING_FEED_ITEM = {
	value: "following",
	label: "Following"
};

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

export function parseAtUri(uri: string) {
  const regex = /at:\/\/(?<did>did.*)\/(?<lexi>.*)\/(?<rkey>.*)/;
  const groups = regex.exec(uri)?.groups;
  return {
    did: groups?.did,
    lexi: groups?.lexi,
    rkey: groups?.rkey
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
