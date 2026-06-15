import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance: QueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});