# Bitmovin Demos
[![bitmovin](http://bitmovin-a.akamaihd.net/webpages/bitmovin-logo-github.png)](http://www.bitmovin.com)

## How to write a demo

In order to create a new demo you need to create a new folder in either the encoding,
analytics, or player folder with the following contents:

  - `info.yaml` (required) - Demo configuration
  - `index.html` (optional) - Entry point of the demo
  - `icon.svg` (optional) - The demo icon
  - `css/` (optional) - Add custom `.css` files withing this folder
  - `js/` (optional) - Add custom `.js` files within this folder


## YAML File Structure
This section will explain what information in your YAML file will be processed and how

#### `title` (string, required)
The title is used to display the demo in the overview and is rendered in the detail view as a header

#### `description` (string, required)
An optional short description which will be displayed in the overview. In the detail view this description will only be rendered if there is no `<div class="description">` in the demo's `index.html` file

#### `executable` (list, optional)
A mandatory section defining the contents of the demo detail page
  - `executable`: `true` or `false`  
    Specifies if the files should be rendered in native html and contain code
  - `indexfile`: e.g. `index.html`  
    Sets the root file which is used to be rendered as the content of the demo
  
#### `code` (list, optional)
An optional section giving information about the code snippets which will be displayed on the demo detail page.
  - `show_code`: `true`  or `false`  
    Should code snippets be included
  - `language`: e.g., `js`, `java`, `c`  
    The default language of the code snippets which will be used for the markup, supported languages can be found here: https://github.com/jneen/rouge/wiki/List-of-supported-languages-and-lexers
  - `files`  
    a list of files which should be included as code snippets (**not** actually executed, but displayed in raw text. JavaScript code to be executed must go into `js/`).
    These snippets will be displayed automatically at the end of the demo page, unless not specified elsewhere (see [Template Patterns](#template-patterns)).

#### `tags` (list, optional)
  An optional list of tags which are used to filter the overview. Categories will be automatically added as tag.

#### `additionalCategories` (list, optional)
  If your demo should show up in more than one category in the overview you can add the additional categories here.
  The original category (the folder the demo lies in) is always included automatically.
  Possible values are `analytics`, `encoding`, and `player`

#### `priority` (number, optional)
  Optional configuration that affects sorting. Defaults to `0`.

#### `hide_github_link` (boolean, optional)
  Remove the link to the GitHub repository by setting this to `true`. Defaults to `false`.

#### `buttons` (list, optional)
Add a list of buttons, where each entry should have the following data:
  - `name`  
    A unique identifier
  - `text`  
    Display text
  - `url`  
    Go there on button click
  - `name`  
    An icon name

## Minimal YAML File Example

```yaml
title: Hello World
executable:
  executable: false
  indexfile: index.html
```

## Template Patterns
The following patterns will be replaced in the demo's index page:

#### `${code:filename.ending:language}`
To specify the location of code snippets (defined in `code.files` of `info.yaml`) to be displayed, use the following:
```
${code:myFile.css:css}
```
> While the `:css` part may be omitted, it can be used to overwrite the default, set in `code.language` of `info.yaml`.

#### `<h1 class="demo-title">`
If the demo template contains this element for the title, it will overwrite `title` from `info.yaml`

#### `<div class="description">`
Also `description` of `info.yaml` may be overwritten with a custom element.
