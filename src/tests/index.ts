import { it, assert, assertThrows } from '../../tests/browser'
import { FonsForm } from '../../types/form'

it('should hello', () => {
    let hi = document.querySelector('h1') as HTMLHeadingElement
    assert(hi.textContent === 'Hello, World!')
})

