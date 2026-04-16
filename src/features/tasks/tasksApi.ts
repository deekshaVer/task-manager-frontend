import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  projectId?: string;
}

export interface Project {
  _id: string;
  name: string;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL + "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Tasks", "Projects"],

  endpoints: (builder) => ({
    // GET tasks
    getTasks: builder.query<Task[], void>({
      query: () => "/tasks",
      providesTags: ["Tasks"],
    }),

    // CREATE task
    addTask: builder.mutation<
      Task,
      { title: string; dueDate?: string; priority: string; projectId?: string }
    >({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),

    // TOGGLE task

    updateTask: builder.mutation<Task, Partial<Task>>({
      query: ({ _id, ...rest }) => ({
        url: `/tasks/${_id}`,
        method: "PATCH",
        body: rest,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistically update cache
        const patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const task = draft.find((t) => t._id === arg._id);
            if (task) {
              Object.assign(task, arg);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // DELETE task
    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const index = draft.findIndex((task) => task._id === id);
            if (index !== -1) {
              draft.splice(index, 1);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",
      providesTags: ["Projects"],
    }),
    addProject: builder.mutation({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),
    reorderTasks: builder.mutation({
      query: (tasks) => ({
        url: "/tasks/reorder",
        method: "PATCH",
        body: tasks,
      }),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectsQuery,
  useAddProjectMutation,
  useReorderTasksMutation,
} = tasksApi;
