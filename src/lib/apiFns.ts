import AtpAgent, { Agent } from "@atproto/api";

type ApiCustomFeedOptions = {
	uri: string;
	cursor: string;
	limit: number;
	agent: Agent | AtpAgent;
};

export async function fetchCustomFeed({

}: ApiCustomFeedOptions) {

}
