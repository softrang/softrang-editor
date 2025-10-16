/*!
 * Softrang Custom Text Editor JS | MIT License
 * Copyright (c) 2025 Softrang | https://www.softrang.com
 */
(function(){
  function q(id){ return document.getElementById(id); }

  function init() {
    const textareas = document.querySelectorAll('textarea.softrang-editor');
    if(!textareas.length) return;

    textareas.forEach((ta, index) => {
      const editorId = 'softrang_editable_' + index;
      const wordcountId = 'softrang_wordcount_' + index;
      const headingId = 'softrang_heading_' + index;
      const fontsizeId = 'softrang_fontsize_' + index;
      const colorId = 'softrang_color_' + index;
      const bgcolorId = 'softrang_bgcolor_' + index;
      const linkId = 'softrang_insert_link_' + index;
      const uploadId = 'softrang_upload_image_' + index;
      const imageInputId = 'softrang_image_input_' + index;
      const tableId = 'softrang_table_' + index;
      const codeId = 'softrang_code_' + index;
      const clearId = 'softrang_clear_' + index;
      const toggleThemeId = 'softrang_toggle_theme_' + index;
      const saveId = 'softrang_save_' + index;

      ta.classList.add('softrang-hidden');

      const wrap = document.createElement('div');
      wrap.className = 'softrang-editor-wrap';
      wrap.innerHTML = `
        <div class="softrang-toolbar" role="toolbar">
          <button type="button" data-cmd="undo">↩</button>
          <button type="button" data-cmd="redo">↪</button>
          <button type="button" data-cmd="bold"><b>B</b></button>
          <button type="button" data-cmd="italic"><i>I</i></button>
          <button type="button" data-cmd="underline"><u>U</u></button>
          <select id="${headingId}">
            <option value="">Paragraph</option>
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
          </select>
          <select id="${fontsizeId}">
            <option value="14" selected>14px</option>
            <option value="18">18px</option>
            <option value="24">24px</option>
          </select>
          <input type="color" id="${colorId}" title="Text color">
          <input type="color" id="${bgcolorId}" title="Highlight color">
          <button type="button" data-cmd="insertUnorderedList">•</button>
          <button type="button" data-cmd="insertOrderedList">1.</button>
          <button type="button" id="${linkId}">🔗</button>
          <button type="button" id="${uploadId}">📁</button>
          <input type="file" id="${imageInputId}" accept="image/*" style="display:none">
          <button type="button" id="${tableId}">📊</button>
          <button type="button" id="${codeId}">💻</button>
          <button type="button" id="${clearId}">🧹</button>
          <button type="button" id="${toggleThemeId}">🌙</button>
          <button type="button" id="${saveId}">💾</button>
        </div>
        <div contenteditable="true" class="softrang-editable" id="${editorId}"></div>
        <div class="softrang-footer"><span id="${wordcountId}">Words: 0</span></div>
      `;

      ta.parentNode.insertBefore(wrap, ta.nextSibling);
      const editor = q(editorId);
      const wc = q(wordcountId);

  
      editor.innerHTML = ta.value.trim() || '<p>Start writing…</p>';

    
      wrap.querySelectorAll('[data-cmd]').forEach(btn=>{
        btn.addEventListener('click', ()=> {
          document.execCommand(btn.getAttribute('data-cmd'), false, null);
          editor.focus(); sync();
        });
      });

     
      q(headingId).addEventListener('change', e=>{
        document.execCommand('formatBlock', false, e.target.value || 'p');
        editor.focus(); sync();
      });

     
      q(fontsizeId).addEventListener('change', e=>{
        const size = e.target.value;
        document.execCommand('fontSize', false, 7);
        editor.querySelectorAll('font[size="7"]').forEach(el=>{
          el.removeAttribute('size');
          el.style.fontSize = size+'px';
        });
        editor.focus(); sync();
      });

      
      q(colorId).addEventListener('input', e=>{
        document.execCommand('foreColor', false, e.target.value);
        editor.focus(); sync();
      });

    
      q(bgcolorId).addEventListener('input', e=>{
        try { document.execCommand('hiliteColor', false, e.target.value); }
        catch{ document.execCommand('backColor', false, e.target.value); }
        editor.focus(); sync();
      });

    
      q(linkId).addEventListener('click', ()=>{
        const url = prompt('Enter URL (https://...)');
        if(url) document.execCommand('createLink', false, url);
        editor.focus(); sync();
      });

      
      q(uploadId).addEventListener('click', ()=> q(imageInputId).click());
      q(imageInputId).addEventListener('change', function(){
        const file = this.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = ev=>{
          document.execCommand('insertImage', false, ev.target.result);
          sync();
        };
        reader.readAsDataURL(file);
      });

    
      q(tableId).addEventListener('click', ()=>{
        const r = parseInt(prompt('Rows',2),10)||2;
        const c = parseInt(prompt('Columns',2),10)||2;
        let html='<table style="border-collapse:collapse;width:100%;">';
        for(let i=0;i<r;i++){
          html+='<tr>';
          for(let j=0;j<c;j++) html+='<td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>';
          html+='</tr>';
        }
        html+='</table><p></p>';
        document.execCommand('insertHTML', false, html);
        sync();
      });

    
      q(codeId).addEventListener('click', ()=>{
        const sel = window.getSelection().toString();
        if(sel){
          const code = `<pre><code>${escapeHtml(sel)}</code></pre><p></p>`;
          document.execCommand('insertHTML', false, code);
        } else {
          document.execCommand('formatBlock', false, 'pre');
        }
        sync();
      });

      
      q(clearId).addEventListener('click', ()=>{ document.execCommand('removeFormat'); sync(); });

     
      q(saveId).addEventListener('click', ()=>{
        const blob = new Blob([editor.innerHTML], {type:'text/html'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'softrang-content.html';
        a.click();
      });

  
      q(toggleThemeId).addEventListener('click', ()=> wrap.classList.toggle('softrang-dark'));

    
      function sync(){
        ta.value = editor.innerHTML;
        const count = editor.innerText.replace(/\u00A0/g,' ').trim().split(/\s+/).filter(Boolean).length;
        wc.textContent = 'Words: '+count;
      }

      ['input','keyup','paste','change'].forEach(ev=> editor.addEventListener(ev, ()=> setTimeout(sync,50)));
      const parentForm = ta.closest('form');
      if(parentForm) parentForm.addEventListener('submit', ()=> sync());
      sync();
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();
