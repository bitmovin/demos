</br>

> :warning: **This repository is not meant to be used for local development but serves as source for the code samples shown at [bitmovin.com/demos](https://bitmovin.com/demos/).**

</br>
</br>

# Bitmovin Demos
[![bitmovin](http://bitmovin-a.akamaihd.net/webpages/bitmovin-logo-github.png)](http://www.bitmovin.com)

# Introduction
Welcome to Bitmovin demos. Our demo page is hosted at [bitmovin.com/demos](https://bitmovin.com/demos/).

## Testing a demo

If you wish to test a demo, you can either browse one of our demos hosted on our [demo page](https://bitmovin.com/demos/) or 
navigate to a demo inside one of our products, for example [player/4k](./player/4k) and follow these steps:
  1. Copy the `index.html`
  1. Replace the`${code:setup.js}` (depending on the demo name may vary) with the contents, wrapping it with a `<script>` tag
  1. Open your custom webpage

## Creating a demo
In order to create a new demo, you need to create a new folder (with new demo name) in either the
[demos/analytics](./demos/analytics), [demos/encoding](./demos/encoding) or [demos/player](./demos/player) folder,
depending on the category of the demo, with the following contents:

- `info.yaml` (required) - Demo configuration
- `index.html` (optional) - Entry point of the demo
- `icon.svg` (optional) - The demo icon
- `css/` (optional) - Add custom `.css` files withing this folder
- `js/` (optional) - Add custom `.js` files within this folder

## Demo `yaml.info` file structure

This section will explain what information in your YAML file will be processed and how to create your own
Take an example xml like this one [player/drm/info.xml](./demos/player/drm/info.yaml)

### Minimal YAML File Example

```yaml
title: Hello World
executable:
  executable: false
  indexfile: index.html
```

### YAML keys:

#### `title` (string, required)

The title is used to display the demo in the overview and is rendered in the detail view as a header

#### `description` (string, required)

An optional short description which will be displayed in the overview. In the detail view this description will only be rendered if there is no `<div class="description">` in the demo's `index.html` file

#### `executable` (list, optional)

A mandatory section defining the contents of the demo detail page

- `executable`: `true` or `false`  
  Specifies if the files should be rendered in native html and contain code that will be replaced during compilation
- `indexfile`: e.g. `index.html`  
  Sets the root file which is rendered as the content of the demo

#### `code` (list, optional)

An optional section giving information about the code snippets which will be displayed on the demo detail page.

- `show_code`: `true` or `false`  
  Should code snippets be included
- `language`: e.g., `js`, `java`, `c`  
  The default language of the code snippets which will be used for the markup, supported languages can be found here: https://github.com/jneen/rouge/wiki/List-of-supported-languages-and-lexers
- `files`  
  a list of files which should be included as code snippets (**not** actually executed, but displayed in raw text. JavaScript code to be executed must go into `js/`).
  These snippets will be displayed automatically at the end of the demo page, unless not specified elsewhere (see [Template Patterns](#demo-html-template-placeholders)).

#### `tags` (list, optional)

An optional list of tags which are used to filter the overview. Categories will be automatically added as tag.

#### `additionalCategories` (list, optional)

If your demo should show up in more than one category in the overview you can add the additional categories here.
The original category (the folder the demo lies in) is always included automatically.
Possible values are `analytics`, `encoding`, and `player`

#### `priority` (number, optional)

The optional configuration that affects sorting. Defaults to `0`.

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

## Demo HTML Template placeholders

The following placeholders will be replaced in the demo's `index.html` page:

### `${code:filename.ending:language}`

To specify the location of code snippets (defined in `code.files` of `info.yaml`) to be displayed, use the following:

```
${code:myFile.css:css}
```

> While the `:css` part may be omitted, it can be used to overwrite the default, set in `code.language` of `info.yaml`.

### `<h1 class="demo-title">`

If the demo template contains this element for the title, it will overwrite `title` from `info.yaml`

### `<div class="description">`

Also `description` of `info.yaml` may be overwritten with a custom element.
