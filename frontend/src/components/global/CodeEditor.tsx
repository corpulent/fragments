import React, { useEffect, useRef } from "react";
import { StreamLanguage } from "@codemirror/stream-parser";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
} from '@codemirror/view'
import { jsonLanguage } from "@codemirror/lang-json";
import { jinja2 } from "@codemirror/legacy-modes/mode/jinja2";

import { history, historyKeymap } from '@codemirror/history'
import { foldGutter, foldKeymap } from '@codemirror/fold'
import { bracketMatching } from '@codemirror/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { rectangularSelection } from '@codemirror/rectangular-selection'
import { commentKeymap } from '@codemirror/comment'
import { lintKeymap } from '@codemirror/lint'
import { indentOnInput, LanguageSupport } from '@codemirror/language'
import { lineNumbers } from '@codemirror/gutter';
import { defaultKeymap, indentMore, indentLess } from '@codemirror/commands'
import { pythonLanguage } from '@codemirror/lang-python'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { solarizedDark } from './themes/ui/dark'
import darkHighlightStyle from './themes/highlight/dark'

interface ICodeEditorProps {
  data: string;
  language: string;
  onChange: any;
  disabled: boolean;
  lineWrapping: boolean;
}

const languageExtensions: any = {
  json: [new LanguageSupport(jsonLanguage)],
  python: [new LanguageSupport(pythonLanguage)],
  jinja2: [StreamLanguage.define(jinja2)],
  blank: undefined  
}

const themeExtensions = {
  light: [defaultHighlightStyle],
  dark: [solarizedDark]
}

const highlightExtensions = {
  dark: darkHighlightStyle
}

const CodeEditor = (props: ICodeEditorProps) => {
  const { data, language, onChange, disabled, lineWrapping } = props;
  const editor = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    const extensions = [[
      lineNumbers(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...commentKeymap,
        ...completionKeymap,
        ...lintKeymap,
        {
          key: "Tab",
          preventDefault: true,
          run: indentMore,
        },
        {
          key: "Shift-Tab",
          preventDefault: true,
          run: indentLess,
        },
        /*{
          key: "Ctrl-S",
          preventDefault: true,
          run: indentLess,
        }*/
      ]),
      ...(languageExtensions[language]
        ? languageExtensions[language]
        : []),
      EditorView.updateListener.of((update) => {
        if (update.changes) {
          onChange(update.state.doc.toString());
        }
      }),
      ...(disabled
        ? [EditorState.readOnly.of(true)]
        : [EditorState.readOnly.of(false)]),
      ...(lineWrapping
        ? [EditorView.lineWrapping]
        : []),
      ...[themeExtensions["dark"]],
      ...[highlightExtensions["dark"]]
    ]];

    const state = EditorState.create({
      doc: data,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editor.current
    });

    return () => {
      view.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`min-h-0 h-96 overflow-y-auto`} ref={editor}>
    </div>
  )
}

export default CodeEditor;
