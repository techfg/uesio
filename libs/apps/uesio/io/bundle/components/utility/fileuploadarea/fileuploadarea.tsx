import { FunctionComponent } from "react"
import { definition, wire, component, hooks, collection } from "@uesio/ui"

interface FileUploadAreaProps extends definition.UtilityProps {
	accept?: string
	record: wire.WireRecord
	wire: wire.Wire
	fieldId: string
	uploadLabelId?: string
	deleteLabelId?: string
}

const UploadArea = component.registry.getUtility("uesio/io.uploadarea")

const FileUploadArea: FunctionComponent<FileUploadAreaProps> = (props) => {
	const { context, record, wire, fieldId } = props

	const uesio = hooks.useUesio(props)

	const userFile = record.getFieldValue<wire.PlainWireRecord | undefined>(
		fieldId
	)

	const userFileId = userFile?.[collection.ID_FIELD] as string

	const upload = async (files: FileList | null) => {
		if (files && files.length > 0) {
			const collectionFullName = wire.getCollection().getFullName()
			const recordId = record.getIdFieldValue() as string
			const file = files[0]
			const fileResponse = await uesio.file.uploadFile(
				uesio.getContext(),
				file,
				collectionFullName,
				recordId,
				fieldId
			)

			record.set(fieldId, fileResponse)
		}
	}

	const deleteFile = async () => {
		await uesio.file.deleteFile(uesio.getContext(), userFileId)
		record.set(fieldId, "")
	}

	return (
		<UploadArea
			onUpload={upload}
			onDelete={deleteFile}
			context={context}
			accept={props.accept}
			className={props.className}
			uploadLabelId={props.uploadLabelId}
			deleteLabelId={props.deleteLabelId}
		>
			{props.children}
		</UploadArea>
	)
}

export default FileUploadArea