/*!
 * Softrang Custom Text Editor JS | MIT License
 * Copyright (c) 2025 Softrang | https://www.softrang.com
 */
(function(){
  function q(id){ return document.getElementById(id); }
  function init() {
    const ta = q('softrang-editor');
    if(!ta || ta.tagName.toLowerCase() !== 'textarea') return;
    ta.classList.add('softrang-hidden');
    const wrap = document.createElement('div');
    wrap.className = 'softrang-editor-wrap';
    wrap.innerHTML = `
      <div class="softrang-toolbar" role="toolbar" aria-label="Softrang editor toolbar">
        <button type="button" data-cmd="undo" title="Undo">↩</button>
        <button type="button" data-cmd="redo" title="Redo">↪</button>
        <button type="button" data-cmd="bold"><b>B</b></button>
        <button type="button" data-cmd="italic"><i>I</i></button>
        <button type="button" data-cmd="underline"><u>U</u></button>
        <select id="softrang_heading">
          <option value="">Paragraph</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
        </select>
        <select id="softrang_fontsize">
          <option value="14" select >14px</option>
          <option value="18">18px</option>
          <option value="24">24px</option>
        </select>
        <input type="color" id="softrang_color" title="Text color">
        <input type="color" id="softrang_bgcolor" title="Highlight color">
        <button type="button" data-cmd="insertUnorderedList" title="Bullet">•</button>
        <button type="button" data-cmd="insertOrderedList" title="Number">1.</button>
        <button type="button" id="softrang_insert_link" title="Insert link">🔗</button>
        <button type="button" id="softrang_upload_image" title="Upload image">📁</button>
        <input type="file" id="softrang_image_input" accept="image/*" style="display:none">
        <button type="button" id="softrang_table" title="Insert table">📊</button>
        <button type="button" id="softrang_code" title="Code block">💻</button>
        <button type="button" id="softrang_clear" title="Clear formatting">🧹</button>
        <button type="button" id="softrang_toggle_theme" title="Toggle theme">🌙</button>
        <button type="button" id="softrang_save" title="Download HTML">💾</button>
      </div>
      <div contenteditable="true" class="softrang-editable" id="softrang_editable" aria-multiline="true"></div>
      <div class="softrang-footer"><span id="softrang_wordcount">Words: 0</span></div>
    `;
    ta.parentNode.insertBefore(wrap, ta.nextSibling);
    const editor = q('softrang_editable');
    const wc = q('softrang_wordcount');
    if(ta.value && ta.value.trim()){
      editor.innerHTML = ta.value;
    } else {
      editor.innerHTML = '<p>Start writing…</p>';
    }
    wrap.querySelectorAll('[data-cmd]').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        const cmd = btn.getAttribute('data-cmd');
        document.execCommand(cmd, false, null);
        editor.focus();
        syncToTextarea();
      });
    });
    q('softrang_heading').addEventListener('change', e=>{
      const tag = e.target.value || 'p';
      document.execCommand('formatBlock', false, tag);
      editor.focus(); syncToTextarea();
    });
   q('softrang_fontsize').addEventListener('change', e => {
  const size = e.target.value;
  document.execCommand('fontSize', false, 7); 
  const fontElements = editor.querySelectorAll('font[size="7"]');
  fontElements.forEach(el => {
    el.removeAttribute('size');
    el.style.fontSize = size + 'px';
  });
  editor.focus();
  syncToTextarea();
});
    q('softrang_color').addEventListener('input', e=>{
      document.execCommand('foreColor', false, e.target.value);
      editor.focus(); syncToTextarea();
    });
    q('softrang_bgcolor').addEventListener('input', e=>{
      try { document.execCommand('hiliteColor', false, e.target.value); }
      catch(e){ document.execCommand('backColor', false, e.target.value); }
      editor.focus(); syncToTextarea();
    });
    q('softrang_insert_link').addEventListener('click', ()=>{
      const url = prompt('Enter URL (https://...)');
      if(url) document.execCommand('createLink', false, url);
      editor.focus(); syncToTextarea();
    });
    q('softrang_upload_image').addEventListener('click', ()=> q('softrang_image_input').click());
    q('softrang_image_input').addEventListener('change', function(){
      const file = this.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = function(ev){
        document.execCommand('insertImage', false, ev.target.result);
        syncToTextarea();
      };
      reader.readAsDataURL(file);
    });
    q('softrang_table').addEventListener('click', ()=>{
      const r = parseInt(prompt('Rows',2),10) || 2;
      const c = parseInt(prompt('Columns',2),10) || 2;
      let html = '<table style="border-collapse:collapse;width:100%;">';
      for(let i=0;i<r;i++){
        html += '<tr>';
        for(let j=0;j<c;j++) html += '<td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>';
        html += '</tr>';
      }
      html += '</table><p></p>';
      document.execCommand('insertHTML', false, html);
      syncToTextarea();
    });
    q('softrang_code').addEventListener('click', ()=>{
      const sel = window.getSelection().toString();
      if(sel){
        const code = `<pre><code>${escapeHtml(sel)}</code></pre><p></p>`;
        document.execCommand('insertHTML', false, code);
      } else {
        document.execCommand('formatBlock', false, 'pre');
      }
      syncToTextarea();
    });
    q('softrang_clear').addEventListener('click', ()=>{
      document.execCommand('removeFormat', false, null);
      syncToTextarea();
    });
    q('softrang_save').addEventListener('click', ()=>{
      const blob = new Blob([editor.innerHTML], {type:'text/html'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'softrang-content.html';
      a.click();
    });
    q('softrang_toggle_theme').addEventListener('click', ()=>{
      wrap.classList.toggle('softrang-dark');
    });
    function syncToTextarea(){
      ta.value = editor.innerHTML;
      updateWordCount();
    }
    function updateWordCount(){
      const text = editor.innerText.replace(/\u00A0/g,' ').trim();
      const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
      wc.textContent = 'Words: ' + count;
    }
    function escapeHtml(s){
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    ['input','keyup','paste','change'].forEach(ev=>{
      editor.addEventListener(ev, ()=> setTimeout(syncToTextarea, 50));
    });
    let parentForm = ta.closest('form');
    if(parentForm){
      parentForm.addEventListener('submit', ()=> syncToTextarea());
    }
    syncToTextarea();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();
