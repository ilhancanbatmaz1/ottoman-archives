import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('virtual:pwa-register/react', () => ({
    useRegisterSW: () => ({
        offlineReady: [false, null],
        needRefresh: [false, null],
        updateServiceWorker: vi.fn(),
    }),
}))
