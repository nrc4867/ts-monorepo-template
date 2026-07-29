import { implement } from '@orpc/server'
import { healthContract } from '@project/api-contract'

export const healthRouter = implement(healthContract).handler(() => ({ status: 'ok' as const }))
