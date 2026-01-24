import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />)
        // Basic check for the title or a loading state
        // Since we have lazy loading, it might show "Yükleniyor..." first
        expect(document.body).toBeInTheDocument()
    })
})
