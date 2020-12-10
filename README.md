# elm-tailwind-postcss

[Elm](http://elm-lang.org) + [Tailwindcss](https://tailwindcss.com) + [Parcel](https://parceljs.org/) = :rocket:

See the [demo-repo](https://github.com/psophea/elm-tailwind-postcss/tree/master/demo).

Instead of using tailwindcss classes directly as string, which might accidently causing typo, you can use this package to generate tailwindcss classes into Elm module and use it as normal Elm function with the help of Elm Compiler to check for error.

This package is inspired by [postcss-elm-tailwind](https://github.com/monty5811/postcss-elm-tailwind). Some code and idea got from that repo.

Below is what view function might look like using Tailwind function.

```elm
view : Model -> Html Msg
view model =
    Html.div 
      [ T.h_screen
      , T.w_screen
      , T.flex
      , T.justify_center
      , T.items_center
      , T.bg_gray_200 
      ]
      [ Html.div 
        []
        [ Html.button
          [ E.onClick Decrement
          , T.px_2
          , T.px_4
          , T.text_white
          , T.bg_blue_500
          , T.w_full
          ]
          [ Html.text "-" 
          ]
          , Html.div
            [ T.text_2xl
            , T.text_center
            , T.my_4
            ]
            [ Html.text (String.fromInt model) 
            ]
          , Html.button
            [ E.onClick Increment
            , T.px_2
            , T.px_4
            , T.text_white
            , T.bg_blue_500
            , T.w_full
            ]
            [ Html.text "+" 
            ]
          ]
        ]
```

## Installation

```
npm i -D elm-tailwind-postcss
```

## Usage

### postcss.config.js

```js
// tailwind to elm config
const etcconfig = {
    elmFile: "src/Tailwind/Tailwind.elm",
    elmModuleName: "Tailwind.Tailwind",
    formats: {
        svg: {
            elmFile: "src/Tailwind/Svg.elm",
            elmModuleName: "Tailwind.Svg"
        },
        string: {
            elmFile: "src/Tailwind/String.elm",
            elmModuleName: "Tailwind.String"
        }
    }
};

// purge
const purgeconfig = {
    content: ['./tmp/**/*.js'],
};

const process = require("process");
const autoprefixer = require("autoprefixer");
const purgecss = require('@fullhuman/postcss-purgecss')(purgeconfig);
const tailwindcss = require("tailwindcss")("tailwind.config.js");
const etc = require("elm-tailwind-postcss")(etcconfig);

const development = {
    plugins: 
        [ tailwindcss
        , etc
        , autoprefixer
        ],
};

// first build will bundle Elm, and Tailwind but didn't purge CSS yet.
const firstbuild = {
    plugins:
        [ tailwindcss
        , autoprefixer
        ],
};

// production build will use result from first build and produce minified, purged CSS.
const production = {
    plugins: 
        [ tailwindcss
        , purgecss
        , autoprefixer
        ],
};

if (process.env.NODE_ENV === "firstbuild") {
    module.exports = firstbuild;
}
else if (process.env.NODE_ENV === "production") {
    module.exports = production;
} else {
    module.exports = development;
}
```

### tailwind.css.config

Purge feature in Tailwind config has been disabled to avoid warning message as we have configured it in postcss config already.

```js
module.exports = {
    purge: false,
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
}

```

### Other output formats

#### SVG

If you want to use Tailwind classes to style `SVG` you can output an `Svg` module like this:

```js
module.exports = {
  plugins: [
    require("tailwindcss"),
    require("elm-tailwind-postcss")({
      elmFile: "src/Tailwind/Tailwind.elm",
      elmModuleName: "Tailwind.Tailwind",
      formats: {
        svg: {
          elmFile: "src/Tailwind/Svg.elm",
          elmModuleName: "Tailwind.Svg"
        }
      }
    })
  ]
};
```

#### String

If you want access to the class names themselves, you can output a `String` module as an escape hatch:

```js
module.exports = {
  plugins: [
    require("tailwindcss"),
    require("elm-tailwind-postcss")({
      elmFile: "src/Tailwind/Tailwind.elm",
      elmModuleName: "Tailwind.Tailwind",
      formats: {
        string: {
          elmFile: "src/Tailwind/String.elm",
          elmModuleName: "Tailwind.String"
        }
      }
    })
  ]
};
```



## Production Build

We are using [Parcel](https://parceljs.org/) for building the project.

In order to get a small build, you'll neet to build Tailwind twice - once without purgecss to build `Tailwind.elm` with all the classes and once with purgecss so that all the unused classes are removed from your production CSS.
See how this is implemented in the [demo](https://github.com/psophea/elm-tailwind-postcss/tree/master/demo)

### First Build

```
set NODE_ENV=firstbuild&&npx parcel build --out-dir tmp --public-url ./ index.html
```

The first build will output the result into `tmp` directory which contains all classes without purgecss.

### Last Build/Production Build

```
set NODE_ENV=production&&npx parcel build --out-dir dist --public-url ./ ./tmp/index.html
```

The last build will get result from the first build and purge all unused classes and output into `dist` directory.



## Syntax Changes

As Elm has restriction for function name, some Tailwind classes will be converted to be valid Elm function name.

```elm
-- starts with number becomes "i_": 2xl -> i_2xl
div [ T.i_2xl ][]

-- starts with minus sign becomes "neg_": -m-2 -> neg_m_2
div [ T.neg_m_2][]

-- hyphene becomes "_": m-2 -> m_2
div [ T.m_2 ][]

-- colon becomes "__": sm:m-2 -> sm__m_2
div [ T.sm__m_2 ][]

-- divider becomes "over": inset-1/2 -> inset_1over2
div [ T.inset_1over2 ][]

-- dot sign becomes "_dot_": -inset-x-2.5 -> neg_inset_x_2_dot_5
div [ T.neg_inset_x_2_dot_5 ][]
```