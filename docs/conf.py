
import themata

project = 'kyofuuc.js'
copyright = '2022, Thecarisma - MIT License'
author = 'Adewale Azeez and Other Contributors'

html_theme_path = [themata.get_html_theme_path()]
html_theme = 'sugar'
master_doc = 'index'
html_favicon = 'kyofuuc.js.png'
main_doc = 'index'
html_static_path = ['_static']

html_css_files = {
    'css/kyofuuc.css'
}
html_js_files = {
    'js/kyofuuc.js'
}

extensions = ['m2r2', ]
source_suffix = ['.rst', '.md']

html_theme_options = {
    'index_is_single': False,
    'show_navigators_in_index': False,
    #'collapsible_sidebar': False,
    'collapsible_sidebar_display': 'block',
    'navbar_links': [
        ('Documentation', 'en/getting_started/index'),
        ('View on Github', 'https://github.com/kyofuuc/kyofuuc.js'),
        ('Download On NPM', 'https://www.npmjs.com/package/kyofuuc')
    ],
    #'has_left_sidebar': True,
    'has_right_sidebar': True,
    'show_navigators': True,
    'social_icons': [
        ('fab fa-twitter', 'https://twitter.com/exoticlibs'),
        ('fab fa-github', 'https://github.com/kyofuuc/kyofuuc.js/')
    ],
    'no_sidebar': [
        'index'
    ],
    "source_root": "https://github.com/kyofuuc/kyofuuc.js/main/docs",
    "document_font_size": "17px",
    "metadata": {
        "enable": True,
        "url": "https://github.com/kyofuuc/kyofuuc.js/",
        "type": "website",
        "title": "Simple yet powerful HTTP, WS client with cache and offline support for JavaScript. For both browser and node.js.",
        "description": "Simple yet powerful HTTP, WS client with cache and offline support for JavaScript. For both browser and node.js.",
        "image": "https://raw.githubusercontent.com/kyofuuc/kyofuuc.js/main/docs/kyofuuc.js.png",
        "keywords": "thecarisma, http, websocket, cache, queue, offline, client, axios, javascript, react, react-native, nodejs",
        "author": "Adewale Azeez"
    },
    "twitter_metadata": {
        "enable": True,
        "card": "summary",
        "site": "@exoticlibs",
        "creator": "@iamthecarisma",
        "title": "Simple yet powerful HTTP, WS client with cache and offline support for JavaScript. For both browser and node.js.",
        "description": "Simple yet powerful HTTP, WS client with cache and offline support for JavaScript. For both browser and node.js.",
        "image": "https://raw.githubusercontent.com/kyofuuc/kyofuuc.js/main/docs/kyofuuc.js.png",
    },

    "header_background_color": "#2f29c4",
    "header_sec_background_color": "#0e0a7a",
}