import { api } from "@/store/api";

export type GraphNodeType =
  | "AREA"
  | "GOAL"
  | "PROJECT"
  | "TASK"
  | "HABIT"
  | "TOPIC"
  | "NOTEBOOK"
  | "NOTE";

export type GraphEdgeRelation =
  | "AREA_GOAL"
  | "AREA_HABIT"
  | "AREA_TOPIC"
  | "AREA_TASK"
  | "GOAL_PROJECT"
  | "PROJECT_TASK"
  | "TOPIC_NOTEBOOK"
  | "TOPIC_NOTE";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: GraphEdgeRelation;
}

export interface GraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  counts: Record<GraphNodeType, number>;
  generatedAt: string;
}

export const graphApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGraph: builder.query<GraphResult, void>({
      query: () => ({ url: "/graph", method: "GET" }),
      providesTags: [{ type: "Graph", id: "ALL" }],
    }),
  }),
});

export const { useGetGraphQuery } = graphApi;
