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

const firstbuild = {
    plugins:
        [ tailwindcss
        , autoprefixer
        ],
};

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