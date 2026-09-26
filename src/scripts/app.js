// Default rules
const defaultRuleSets = {
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

const ruleSets = { ...defaultRuleSets };

// Set from JS because Astro's HTML compression collapses whitespace in markup
const defaultCode = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>HTMLHint</title>
  </head>
  <body>
    <div>HTMLHint: help your html code better
  </body>
</html>
`;

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

function readStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (e.g. private mode); ignore
  }
}

function loadRules() {
  const savedRuleSets = readStorage('htmlhintRules');
  if (savedRuleSets && typeof savedRuleSets === 'object') {
    // Replace the defaults so rules the user disabled stay disabled
    for (const key of Object.keys(ruleSets)) {
      delete ruleSets[key];
    }
    Object.assign(ruleSets, savedRuleSets);
    // Clean up a non-rule key stored by older versions
    delete ruleSets['editor-theme'];
  }
}

function saveRules() {
  writeStorage('htmlhintRules', ruleSets);
}

function initEditor() {
  let upTimer;
  editor = ace.edit("editor");
  editor.setShowPrintMargin(false);
  editor.setTheme("ace/theme/merbivore");
  editor.getSession().setMode("ace/mode/html");
  // HTMLHint provides the annotations; Ace's own HTML worker isn't bundled
  editor.getSession().setUseWorker(false);
  editor.setValue(defaultCode, -1);

  editor.on('change', () => {
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

  jShowLast.addEventListener('click', () => {
    showLastHint();
    editor.focus();
  });
  jShowNext.addEventListener('click', () => {
    showNextHint();
    editor.focus();
  });
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

    // Sort by position so previous/next navigation works correctly
    errors.sort((a, b) => a.row - b.row || a.column - b.column);

    arrHints = errors;
    editor.getSession().setAnnotations(errors);

    const errorCount = errors.length;
    jHintState.innerHTML = `Find Hints: <strong>${errorCount}</strong>`;

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
  const dataStr = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(ruleSets, null, 2))}`;
  jsDownloadConfig.href = dataStr;
  jsDownloadConfig.download = '.htmlhintrc';
}

function initOptions() {
  // Handle checkbox changes
  document.querySelectorAll('#options input[type=checkbox]').forEach((checkbox) => {
    checkbox.addEventListener('change', function() {
      const id = this.id;
      const ruleValue = this.checked;

      if (ruleValue === true) {
        const valueElement = document.getElementById(`${id}_value`);
        if (valueElement) {
          ruleSets[id] = valueElement.value;
        } else {
          ruleSets[id] = ruleValue;
        }
        const valueArea = document.getElementById(`${id}_valuearea`);
        if (valueArea) {
          valueArea.classList.remove('d-none');
        }
      } else {
        delete ruleSets[id];
        const valueArea = document.getElementById(`${id}_valuearea`);
        if (valueArea) {
          valueArea.classList.add('d-none');
        }
      }

      saveRules();
      updateHTMLHint();
    });
  });

  // Handle rule value select changes
  document.querySelectorAll('#options select[id$="_value"]').forEach((select) => {
    select.addEventListener('change', function() {
      const id = this.id.replace(/_value$/, '');
      const checkbox = document.getElementById(id);
      if (!checkbox || !checkbox.checked) {
        return;
      }
      ruleSets[id] = this.value;
      saveRules();
      updateHTMLHint();
    });
  });

  syncOptions();

  jsDownloadConfig.addEventListener('click', downloadConfigFile);
  document.getElementById('reset-rules').addEventListener('click', resetRules);
}

// Update checkboxes and value selects to match the current rules
function syncOptions() {
  document.querySelectorAll('#options input[type=checkbox]').forEach((checkbox) => {
    const id = checkbox.id;
    const enabled = id in ruleSets;
    checkbox.checked = enabled;

    const valueElement = document.getElementById(`${id}_value`);
    if (valueElement) {
      if (enabled) {
        valueElement.value = ruleSets[id];
        // Fall back to the first option if the saved value is no longer valid
        if (valueElement.value !== String(ruleSets[id])) {
          valueElement.selectedIndex = 0;
          ruleSets[id] = valueElement.value;
        }
      } else {
        valueElement.selectedIndex = 0;
      }
    }

    const valueArea = document.getElementById(`${id}_valuearea`);
    if (valueArea) {
      valueArea.classList.toggle('d-none', !enabled);
    }
  });
}

function resetRules() {
  for (const key of Object.keys(ruleSets)) {
    delete ruleSets[key];
  }
  Object.assign(ruleSets, defaultRuleSets);
  syncOptions();
  saveRules();
  updateHTMLHint();
}
