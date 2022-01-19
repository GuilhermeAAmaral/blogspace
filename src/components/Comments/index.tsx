import React, {Component, ReactElement} from "react";

export default class Comments extends Component {

  componentDidMount () {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-uterances");
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.setAttribute("async", 'true');
      script.setAttribute("repo", "GuilhermeAAmaral/blogspace");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute( "theme", "dark-blue");
      anchor.appendChild(script);
  }

  render() {
    return (
        <div id="inject-comments-for-uterances"></div>
    );
  }
}