// Default rules
const ruleSets = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': true,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'attr-no-duplication': true,
  'title-require': true,
  'main-require': true,
  'meta-charset-require': true,
  'meta-description-require': true,
  'meta-viewport-require': true,
  'html-lang-require': true,
  'h1-require': true,
  'button-type-require': true,
  'input-requires-label': true
};

const settings = {
  editorTheme: 'merbivore'
};

let editor;
let arrHints = [];

// DOM elements
let jHintState;
let jButtonArea;
let jShowLast;
let jShowNext;
let jsDownloadConfig;

export function initApp() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupApp);
  } else {
    setupApp();
  }
}

function setupApp() {
  // Initialize DOM elements
  jHintState = document.getElementById('hint-state');
  jButtonArea = document.getElementById('button-area');
  jShowLast = document.getElementById('show-last');
  jShowNext = document.getElementById('show-next');
  jsDownloadConfig = document.getElementById('download-config');

  loadSettings();
  loadRules();
  initEditor();
  initOptions();

  // Wait for HTMLHint to be loaded
  waitForHTMLHint();
}

function waitForHTMLHint() {
  if (window.HTMLHint && window.HTMLHint.HTMLHint && typeof window.HTMLHint.HTMLHint.verify === 'function') {
    updateHTMLHint();
  } else {
    setTimeout(waitForHTMLHint, 50);
  }
}

function loadSettings() {
  const saveSettings = localStorage.getItem('htmlhintSettings');
  if (saveSettings) {
    Object.assign(settings, JSON.parse(saveSettings));
  }
}

function saveSettings() {
  localStorage.setItem('htmlhintSettings', JSON.stringify(settings));
}

function loadRules() {
  const saveRuleSets = localStorage.getItem('htmlhintRules');
  if (saveRuleSets) {
    Object.assign(ruleSets, JSON.parse(saveRuleSets));
  }
}

function saveRules() {
  localStorage.setItem('htmlhintRules', JSON.stringify(ruleSets));
}

function initEditor() {
  const jEditorTheme = document.getElementById('editor-theme');

  jEditorTheme.value = settings.editorTheme;
  jEditorTheme.addEventListener('change', function() {
    settings.editorTheme = jEditorTheme.value;
    editor.setTheme("ace/theme/" + settings.editorTheme);
    saveSettings();
  });

  let upTimer;
  editor = ace.edit("editor");
  editor.setShowPrintMargin(false);
  editor.setTheme("ace/theme/" + settings.editorTheme);
  editor.getSession().setMode("ace/mode/html");

  editor.on('change', function(e) {
    clearTimeout(upTimer);
    upTimer = setTimeout(updateHTMLHint, 500);
  });

  // Add keyboard shortcuts
  editor.commands.addCommand({
    name: 'left',
    bindKey: {win: 'Ctrl-Left', mac: 'Command-Left'},
    exec: showLastHint,
    readOnly: true
  });

  editor.commands.addCommand({
    name: 'up',
    bindKey: {win: 'Ctrl-Up', mac: 'Command-Up'},
    exec: showLastHint,
    readOnly: true
  });

  editor.commands.addCommand({
    name: 'right',
    bindKey: {win: 'Ctrl-Right', mac: 'Command-Right'},
    exec: showNextHint,
    readOnly: true
  });

  editor.commands.addCommand({
    name: 'down',
    bindKey: {win: 'Ctrl-Down', mac: 'Command-Down'},
    exec: showNextHint,
    readOnly: true
  });

  jShowLast.addEventListener('mousedown', showLastHint);
  jShowNext.addEventListener('mousedown', showNextHint);
}

function updateHTMLHint() {
  if (!window.HTMLHint) {
    console.warn('HTMLHint not loaded yet');
    return;
  }

  // The HTMLHint library exposes the verify method on HTMLHint.HTMLHint
  const htmlHintInstance = window.HTMLHint.HTMLHint;

  if (!htmlHintInstance || typeof htmlHintInstance.verify !== 'function') {
    console.error('HTMLHint.verify is not a function. HTMLHint object:', window.HTMLHint);
    return;
  }

  const code = editor.getValue();

  try {
    // Use the correct API for the local HTMLHint file
    const messages = htmlHintInstance.verify(code, ruleSets);
    const errors = [];

    for (let i = 0, l = messages.length; i < l; i++) {
      const message = messages[i];
      errors.push({
        row: message.line - 1,
        column: message.col - 1,
        text: message.message,
        type: message.type,
        raw: message.raw
      });
    }

    arrHints = errors;
    editor.getSession().setAnnotations(errors);

    const errorCount = errors.length;
    jHintState.innerHTML = 'Find Hints: <strong>' + errorCount + '</strong>';

    if (errorCount > 0) {
      jButtonArea.style.display = 'block';
    } else {
      jButtonArea.style.display = 'none';
    }
  } catch (error) {
    console.error('Error running HTMLHint:', error);
    jHintState.innerHTML = 'Error: <strong>HTMLHint failed to run</strong>';
  }
}

function showLastHint() {
  if (arrHints.length > 0) {
    const cursor = editor.selection.getCursor();
    const curRow = cursor.row;
    const curColumn = cursor.column;

    for (let i = arrHints.length - 1; i >= 0; i--) {
      const hint = arrHints[i];
      const hintRow = hint.row;
      const hintCol = hint.column;

      if (hintRow < curRow || (hintRow === curRow && hintCol < curColumn)) {
        editor.moveCursorTo(hintRow, hintCol);
        editor.selection.clearSelection();
        break;
      }
    }
  }
  return false;
}

function showNextHint() {
  if (arrHints.length > 0) {
    const cursor = editor.selection.getCursor();
    const curRow = cursor.row;
    const curColumn = cursor.column;

    for (let i = 0; i < arrHints.length; i++) {
      const hint = arrHints[i];
      const hintRow = hint.row;
      const hintCol = hint.column;

      if (hintRow > curRow || (hintRow === curRow && hintCol > curColumn)) {
        editor.moveCursorTo(hintRow, hintCol);
        editor.selection.clearSelection();
        break;
      }
    }
  }
  return false;
}

function downloadConfigFile() {
  const downRules = {};
  for (const key in ruleSets) {
    if (key !== 'editor-theme') {
      downRules[key] = ruleSets[key];
    }
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downRules, null, 2));
  jsDownloadConfig.href = dataStr;
  jsDownloadConfig.download = 'htmlhintrc';
}

function initOptions() {
  // Set version
  const versionElement = document.getElementById('version');
  if (versionElement && window.HTMLHint) {
    // The new HTMLHint library doesn't expose version/release directly
    // We'll use a fixed version since we know it's 1.6.3
    versionElement.textContent = 'v1.8.0';
  }

  // Handle checkbox changes
  document.querySelectorAll('input[type=checkbox]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      const id = this.id;
      const ruleValue = this.checked;

      if (ruleValue === true) {
        const valueElement = document.getElementById(id + '_value');
        if (valueElement && valueElement.length > 0) {
          ruleSets[id] = valueElement.value;
        } else {
          ruleSets[id] = ruleValue;
        }
        const valueArea = document.getElementById(id + '_valuearea');
        if (valueArea) {
          valueArea.style.display = 'block';
        }
      } else {
        delete ruleSets[id];
        const valueArea = document.getElementById(id + '_valuearea');
        if (valueArea) {
          valueArea.style.display = 'none';
        }
      }

      saveRules();
      updateHTMLHint();
    });
  });

  // Handle select changes
  document.querySelectorAll('select').forEach(function(select) {
    select.addEventListener('change', function() {
      const id = this.id.replace('_value', '');
      ruleSets[id] = this.value;
      saveRules();
      updateHTMLHint();
    });
  });

  // Initialize checkboxes based on saved rules
  for (const id in ruleSets) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = true;
      const valueElement = document.getElementById(id + '_value');
      if (valueElement) {
        valueElement.value = ruleSets[id];
        const valueArea = document.getElementById(id + '_valuearea');
        if (valueArea) {
          valueArea.style.display = 'block';
        }
      }
    }
  }

  jsDownloadConfig.addEventListener('mousedown', downloadConfigFile);
}
