import { definition, component } from "@uesio/ui"
import { FunctionComponent, useState, Dispatch, SetStateAction } from "react"

interface LoginFormProps extends definition.BaseProps {
	setMode: Dispatch<SetStateAction<string>>
	logIn: (username: string, password: string) => void
}

const TextField = component.registry.getUtility("uesio/io.textfield")
const FieldWrapper = component.registry.getUtility("uesio/io.fieldwrapper")
const Button = component.registry.getUtility("uesio/io.button")
const Grid = component.registry.getUtility("uesio/io.grid")
const Text = component.registry.getUtility("uesio/io.text")
const Link = component.registry.getUtility("uesio/io.link")

const LoginForm: FunctionComponent<LoginFormProps> = (props) => {
	const { setMode, logIn, context } = props
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")

	return (
		<>
			<FieldWrapper context={context} label="Username">
				<TextField
					context={context}
					value={username}
					setValue={setUsername}
				/>
			</FieldWrapper>
			<FieldWrapper context={context} label="Password">
				<TextField
					context={context}
					value={password}
					setValue={setPassword}
					password
				/>
			</FieldWrapper>
			<Grid
				context={context}
				styles={{
					root: {
						gridTemplateColumns: "1fr 1fr",
						columnGap: "10px",
						padding: "20px 0",
					},
				}}
			>
				<Button
					context={context}
					variant="uesio/io.primary"
					label="Sign In"
					onClick={() => logIn(username, password)}
				/>
				<Button
					context={context}
					label="Cancel"
					variant="uesio/io.secondary"
					onClick={() => {
						setMode("")
					}}
				/>
			</Grid>
			<div>
				<Text
					variant="uesio/io.aside"
					context={context}
					text="Forgot your password?&nbsp;"
				/>
				<Link
					context={context}
					onClick={() => {
						// not implemented
					}}
					text="Reset Password"
				/>
			</div>
			<div>
				<Text
					variant="uesio/io.aside"
					context={context}
					text="No Account?&nbsp;"
				/>
				<Link
					context={context}
					onClick={() => {
						setMode("signup")
					}}
					text="Create Acount"
				/>
			</div>
		</>
	)
}

export default LoginForm