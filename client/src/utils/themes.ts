import {
  vscodeDark,
  dracula,
  monokai,
  githubDark,
  githubLight,
  sublime,
  tokyoNight
} from '@uiw/codemirror-themes-all';
import type { Extension } from '@codemirror/state';

export interface ThemeOption {
  id: string;
  name: string;
  isDark: boolean;
  extension: Extension;
}

export const THEME_OPTIONS: Record<string, ThemeOption> = {
  vscodeDark: {
    id: 'vscodeDark',
    name: 'VS Code Dark',
    isDark: true,
    extension: vscodeDark
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    isDark: true,
    extension: dracula
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai',
    isDark: true,
    extension: monokai
  },
  githubDark: {
    id: 'githubDark',
    name: 'GitHub Dark',
    isDark: true,
    extension: githubDark
  },
  githubLight: {
    id: 'githubLight',
    name: 'GitHub Light',
    isDark: false,
    extension: githubLight
  },
  tokyoNight: {
    id: 'tokyoNight',
    name: 'Tokyo Night',
    isDark: true,
    extension: tokyoNight
  },
  sublime: {
    id: 'sublime',
    name: 'Sublime',
    isDark: true,
    extension: sublime
  }
};
