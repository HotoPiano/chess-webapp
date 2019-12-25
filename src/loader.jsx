import React from "react";
import { css } from "@emotion/core";
import { PacmanLoader } from "react-spinners";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 5%;
  border-color: red;
  height: 3.5rem;
`;

export default class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    return (
      <div className="sweet--loading">
        <PacmanLoader
          css={override}
          //size={150}
          //size={"150px"} this also works
          color={"#3f2f4f"}
          loading={this.state.loading}
        />
      </div>
    );
  }
}
