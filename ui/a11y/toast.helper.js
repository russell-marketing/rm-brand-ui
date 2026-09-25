/* Toast + announce helpers.
 * Use: toast('Saved');
 *      toast('Saved',{variant:'ok'});        -> .toast--ok status bar
 *      toast('Error happened',{polite:false,variant:'error'});
 * variant is one of 'ok' | 'warn' | 'error'; omit it for a plain toast.
 */
export function announce(msg,{polite=true,variant}={}){
  const live = document.querySelector('.rm-toasts') || (()=>{const n=document.createElement('div');n.className='rm-toasts';n.setAttribute('aria-live',polite?'polite':'assertive');n.setAttribute('aria-atomic','true');document.body.appendChild(n);return n;})();
  const t=document.createElement('div');
  t.className = variant ? `rm-toast toast--${variant}` : 'rm-toast'; t.role=polite?'status':'alert'; t.textContent=msg; live.appendChild(t);
  setTimeout(()=>t.remove(), 4000);
}
export const toast = announce;
