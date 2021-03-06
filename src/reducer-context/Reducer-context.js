import { createContext, useContext, useReducer, useEffect } from "react";

import axios from "axios";
import { useLogin } from "./LoginContext";

const Reducercontext = createContext();

export function ReducerProvider({ children }) {
  const { token, isUserLogIn } = useLogin();

  const [
    {
      user,
      playlist,
      data,
      history,
      likedlist,
      sortBy,
      showDuration,
      showCategory,
      loading
    },
    dispatch
  ] = useReducer(reducer, {
    user: {},
    playlist: [],
    data: [],
    history: [],
    likedlist: [],
    sortBy: null,
    showDuration: 0,
    showCategory: [],
    loading: false
  });

  useEffect(() => {
    (async function () {
      try {
        dispatch({ type: "LOAD", payload: true });
        const videodata = await axios.get(
           `${process.env.REACT_APP_api}/video/`,
        );
        dispatch({
          type: "LOAD_VIDEODATA",
          payload: videodata.data
        });

        if (isUserLogIn) {
          dispatch({ type: "LOAD", payload: true });
          const playlist = await axios.get(
            `${process.env.REACT_APP_api}/playlist/`,
          );
          const history = await axios.get(
            `${process.env.REACT_APP_api}/history/`,
          );
          const liked = await axios.get(
            `${process.env.REACT_APP_api}/liked/`,
          );

          dispatch({
            type: "LOAD_PLAYLIST",
            payload: playlist.data.playlistdata
          });
          dispatch({
            type: "LOAD_HISTORY",
            payload: history.data.historydata
          });
          dispatch({
            type: "LOAD_LIKEDLIST",
            payload: liked.data.likeddata
          });
        }
        dispatch({ type: "LOAD", payload: false });
      } catch (error) {
        dispatch({ type: "LOAD", payload: false });
      }
    })();
  }, [isUserLogIn]);
  return (
    <>
      <Reducercontext.Provider
        value={{
          user,
          playlist,
          data,
          history,
          likedlist,
          sortBy,
          showDuration,
          showCategory,
          dispatch,
          loading
        }}
      >
        {children}
      </Reducercontext.Provider>
    </>
  );
}

export function useReduce() {
  return useContext(Reducercontext);
}

export function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, loading: action.payload };
    case "USER":
      return {
        ...state,
        user: { name: action.payload.userName, email: action.payload.email }
      };
    case "RESET":
      return {
        ...state,
        user: {},
        playlist: [],
        history: [],
        likedlist: [],
        sortBy: null,
        showDuration: 0,
        showCategory: []
      };
    case "PLAYING":
      return { ...state, videoobj: action.payload };

    case "SORT":
      return { ...state, sortBy: action.payload };

    case "LOAD_VIDEODATA":
      return { ...state, data: action.payload };

    case "LOAD_PLAYLIST":
      return { ...state, playlist: action.payload };

    case "LOAD_HISTORY":
      return { ...state, history: action.payload };

    case "LOAD_LIKEDLIST":
      return { ...state, likedlist: action.payload };

    case "FILTERCATEGORY":
      if (state.showCategory.includes(action.payload)) {
        return {
          ...state,
          showCategory: state.showCategory.filter(
            (item) => item !== action.payload
          )
        };
      } else {
        return {
          ...state,
          showCategory: [...state.showCategory, action.payload]
        };
      }
    case "CLEAR_FILTER":
      return {
        ...state,
        showCategory: []
      };

    case "NEW_PLAYLIST":
      let { id, name } = action.payload;
      return {
        ...state,
        playlist: [...state.playlist, action.payload]
      };

    case "REMOVE_PLAYLIST":
      return {
        ...state,
        playlist: state.playlist.filter((item) => action.payload !== item.id)
      };

    case "ADD_TO_PLAYLIST": {
      let { playlistid, videoid } = action.payload;

      return {
        ...state,
        playlist: state.playlist.map((item) => {
          if (item.id === playlistid) {
            return {
              id: item.id,
              name: item.name,
              videos:
                item.videos.find((item1) => item1 === videoid) === undefined
                  ? item.videos.concat(videoid)
                  : item.videos
            };
          }
          return item;
        })
      };
    }

    case "REMOVE_FROM_PLAYLIST": {
      let { playlistid, videoid } = action.payload;
      return {
        ...state,
        playlist: state.playlist.map((item) => {
          if (item.id === playlistid) {
            return {
              id: item.id,
              name: item.name,
              videos: item.videos.filter((item1) => item1 !== videoid)
            };
          }
          return item;
        })
      };
    }

    case "ADD_TO_HISTORY":
      let findhistory = state.history.find(
        (item) => item.historyId === action.payload.historyId
      );
      if (findhistory) {
        let historynewarr = state.history.map((item) => {
          if (item.historyId === action.payload.historyId) {
            return {
              ...item,
              lastseen: action.payload.lastseen
            };
          }
          return item;
        });

        return { ...state, history: historynewarr };
      } else {
        return { ...state, history: [...state.history, action.payload] };
      }

    case "REMOVE_FROM_HISTORY":
      return {
        ...state,
        history: state.history.filter(
          (item) => item.historyId !== action.payload.historyId
        )
      };

    case "ADD_TO_LIKEDLIST":
      return { ...state, likedlist: [...state.likedlist, action.payload] };

    case "REMOVE_FROM_LIKEDLIST":
      return {
        ...state,
        likedlist: state.likedlist.filter((item) => item !== action.payload)
      };
    default:
      return console.log("error");
  }
}