import HTMLHint from 'htmlhint';

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

// Rules that contradict each other; enabling one disables the other
const conflictingRules = {
  'attr-value-double-quotes': 'attr-value-single-quotes',
  'attr-value-single-quotes': 'attr-value-double-quotes',
  'tag-self-close': 'empty-tag-not-self-closed',
  'empty-tag-not-self-closed': 'tag-self-close'
};

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

async function setupApp() {
  // Initialize DOM elements
  jHintState = document.getElementById('hint-state');
  jButtonArea = document.getElementById('button-area');
  jShowLast = document.getElementById('show-last');
  jShowNext = document.getElementById('show-next');
  jsDownloadConfig = document.getElementById('download-config');

  loadRules();
  initOptions();

  // Ace is large, so load it after the rest of the page is interactive
  try {
    await initEditor();
  } catch (error) {
    console.error('Error loading the editor:', error);
    jHintState.innerHTML = 'Error: <strong>The editor failed to load</strong>';
    return;
  }
  updateHTMLHint();
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

async function initEditor() {
  let upTimer;
  const { default: ace } = await import('ace-builds');
  // Modes and themes register themselves on the global ace, so load them after it
  await Promise.all([
    import('ace-builds/src-noconflict/mode-html'),
    import('ace-builds/src-noconflict/theme-merbivore')
  ]);
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

  // F8 / Shift-F8 match other editors and don't override Ace's cursor movement keys
  editor.commands.addCommand({
    name: 'previousHint',
    bindKey: {win: 'Shift-F8', mac: 'Shift-F8'},
    exec: showLastHint,
    readOnly: true
  });

  editor.commands.addCommand({
    name: 'nextHint',
    bindKey: {win: 'F8', mac: 'F8'},
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
  // Rule changes can arrive before the editor has loaded
  if (!editor) {
    return;
  }

  const code = editor.getValue();

  try {
    const messages = HTMLHint.HTMLHint.verify(code, ruleSets);
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
    jHintState.innerHTML = `Hints found: <strong>${errorCount}</strong>`;

    if (errorCount > 0) {
      jButtonArea.style.display = 'block';
    } else {
      jButtonArea.style.display = 'none';
    }
  } catch (error) {
    console.error('Error running HTMLHint:', error);
    arrHints = [];
    editor.getSession().clearAnnotations();
    jButtonArea.style.display = 'none';
    jHintState.innerHTML = 'Error: <strong>HTMLHint failed to run</strong>';
  }
}

function moveToHint(hint) {
  editor.clearSelection();
  editor.gotoLine(hint.row + 1, hint.column, true);
}

// Move to the closest hint before the cursor, wrapping to the last one
function showLastHint() {
  if (arrHints.length === 0) {
    return false;
  }
  const { row, column } = editor.selection.getCursor();
  const hint = arrHints.findLast((h) => h.row < row || (h.row === row && h.column < column));
  moveToHint(hint || arrHints[arrHints.length - 1]);
  return false;
}

// Move to the closest hint after the cursor, wrapping to the first one
function showNextHint() {
  if (arrHints.length === 0) {
    return false;
  }
  const { row, column } = editor.selection.getCursor();
  const hint = arrHints.find((h) => h.row > row || (h.row === row && h.column > column));
  moveToHint(hint || arrHints[0]);
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
        const conflict = conflictingRules[id];
        if (conflict && conflict in ruleSets) {
          delete ruleSets[conflict];
          syncOptions();
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
          saveRules();
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
