/**
 * Inject this into browser to test vanilla components.
 */

export function it(desc: string, fn: CallableFunction) {
      try {
        fn();
        console.log('%c\u2714 ' + desc, 'color: green');
      } catch (error) {
        console.log('\n');
        console.log('%c\u2718 ' + desc, 'color: red');
        console.error(error);
      }
    }

export function assert(isTrue: boolean) {
    if (!isTrue) throw new Error();
}

export function assertThrows(fn: CallableFunction, reg: RegExp | null = null) {
  let result = false
  try {
    fn()
  }
  catch(err){
    if(!reg) console.error(err)
    else {
      let message = ''
      if(typeof err === 'string') message = err
      if(err instanceof Error) message = err.message
      result = reg.test(message)
    }
  }
  if (!result) throw new Error();
}
