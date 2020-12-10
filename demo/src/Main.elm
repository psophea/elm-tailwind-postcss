module Main exposing (Msg(..), main, update, view)

import Browser
import Html exposing (..)
import Html.Attributes as A
import Html.Events as E
import Tailwind.Tailwind as T


main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = always Sub.none
        , view = view
        }



-- MODEL


type State
    = NoStarted
    | InProgress
    | Done


type alias Task =
    { id : Int
    , name : String
    , state : State
    }


type alias Model =
    { tasks : List Task
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { tasks = defaultTasks
      }
    , Cmd.none
    )


defaultTasks : List Task
defaultTasks =
    [ { id = 1, name = "Drink a coffee", state = Done }
    , { id = 2, name = "Eat croissants", state = Done }
    , { id = 3, name = "Check my mails", state = InProgress }
    , { id = 4, name = "Daily scrum meeting", state = NoStarted }
    , { id = 5, name = "Start a new user story", state = NoStarted }
    ]



-- UPDATE


type Msg
    = UpdateStateTo Int State
    | Delete Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateStateTo id state ->
            let
                updateState task =
                    if task.id == id then
                        { task | state = state }

                    else
                        task
            in
            ( { model | tasks = List.map updateState model.tasks }, Cmd.none )

        Delete id ->
            ( { model | tasks = List.filter (\task -> task.id /= id) model.tasks }, Cmd.none )



-- VIEW


view model =
    div
        [ T.flex
        , T.flex_col
        , T.w_screen
        , T.h_screen
        , T.items_center
        , T.justify_center
        ]
        [ span
            [ T.text_2xl
            , T.font_bold
            , T.content_center
            ]
            [ text "My tasks"
            ]
        , case List.length model.tasks of
            0 ->
                noMoreTask

            _ ->
                tasksTable model
        ]


noMoreTask =
    span
        [ T.text_sm
        , T.content_center
        ]
        [ text "No more tasks to do, well done !"
        ]


tasksTable model =
    table
        [ T.table_fixed
        ]
        [ thead
            []
            [ tr
                []
                [ th
                    [ T.w_1over4
                    , T.px_4
                    , T.py_4
                    , T.text_gray_900
                    ]
                    [ text "ID"
                    ]
                , th
                    [ T.w_1over2
                    , T.px_4
                    , T.py_4
                    , T.text_gray_900
                    ]
                    [ text "Name"
                    ]
                , th
                    [ T.w_1over4
                    , T.px_4
                    , T.py_4
                    , T.text_gray_900
                    ]
                    [ text "Status"
                    ]
                ]
            ]
        , tbody
            []
            (List.map formatRow model.tasks)
        ]


formatRow : Task -> Html Msg
formatRow task =
    tr
        []
        [ td
            [ T.border
            , T.border_gray_300
            , T.px_4
            , T.py_2
            , T.text_gray_900
            , T.text_sm
            ]
            [ text (String.fromInt task.id)
            ]
        , td
            [ T.border
            , T.border_gray_300
            , T.px_4
            , T.py_2
            , T.text_gray_900
            , T.text_sm
            ]
            [ text task.name
            ]
        , td
            [ T.border
            , T.border_gray_300
            , T.px_4
            , T.py_2
            , T.text_gray_900
            , T.text_sm
            ]
            [ formatState task
            ]
        ]


formatState : Task -> Html Msg
formatState task =
    case task.state of
        Done ->
            button
                [ T.bg_blue_500
                , T.text_white
                , T.rounded
                , T.px_2
                , T.py_1
                , E.onClick (Delete task.id)
                ]
                [ text "Done !"
                ]

        InProgress ->
            button
                [ T.bg_yellow_300
                , T.text_gray_900
                , T.rounded
                , T.px_2
                , T.py_1
                , E.onClick (UpdateStateTo task.id Done)
                ]
                [ text "InProgress"
                ]

        NoStarted ->
            button
                [ T.bg_gray_300
                , T.text_gray_800
                , T.rounded
                , T.px_2
                , T.py_1
                , E.onClick (UpdateStateTo task.id InProgress)
                ]
                [ text "NoStarted"
                ]
