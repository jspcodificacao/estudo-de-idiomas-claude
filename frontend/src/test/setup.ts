import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Executar cleanup após cada teste
afterEach(() => {
  cleanup()
})
