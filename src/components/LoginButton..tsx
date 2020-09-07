import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from "@material-ui/core/Button";

export default () => {
    const auth0 = useAuth0();
    return <span className="cocora-login">
        {auth0.isAuthenticated
        ? <Button variant="contained" onClick={() => auth0.logout()}>Log Out</Button>
        : <Button variant="contained" onClick={() => auth0.loginWithRedirect()}>Log In</Button>}
    </span>
};
