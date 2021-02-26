import { GoogleLogin, GoogleLoginResponse } from "react-google-login"
import React, { FunctionComponent } from "react"
import { definition, hooks, styles } from "@uesio/ui"
import LoginWrapper from "../loginhelpers/wrapper"
import { getButtonWidth } from "../loginhelpers/button"

type LoginDefinition = {
	text: string
	clientId: string
	align: "left" | "center" | "right"
}

interface LoginProps extends definition.BaseProps {
	definition: LoginDefinition
}

const useStyles = styles.getUseStyles(["googleButton"], {
	googleButton: {
		width: getButtonWidth(),
		paddingRight: "8px !important",
	},
})

const LoginGoogle: FunctionComponent<LoginProps> = (props) => {
	const uesio = hooks.useUesio(props)
	const clientIdKey = props.definition.clientId
	const clientIdValue = uesio.view.useConfigValue(clientIdKey)
	const classes = useStyles(props)
	const buttonText = props.definition.text

	if (!clientIdValue) return null

	const responseGoogle = (response: GoogleLoginResponse): void => {
		uesio.signal.run(
			{
				signal: "user/LOGIN",
				type: "google",
				token: response.getAuthResponse().id_token,
			},
			props.context
		)
	}

	//To-Do: show an error
	const responseGoogleFail = (error: Error): void => {
		console.log("Login Failed", error)
	}

	return (
		<LoginWrapper align={props.definition.align}>
			<GoogleLogin
				clientId={clientIdValue}
				buttonText={buttonText}
				onSuccess={responseGoogle}
				onFailure={responseGoogleFail}
				cookiePolicy="single_host_origin"
				className={classes.googleButton}
				autoLoad={false}
			/>
		</LoginWrapper>
	)
}

export default LoginGoogle
