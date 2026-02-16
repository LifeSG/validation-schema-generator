import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { jsonToSchema } from "../../schema-generator";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

const FILENAME = "hello.jpg";
const JPG_BASE64 =
	"data:file/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";
const JPG_1KB_BASE64 =
	"data:file/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCADqATkDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACQQAQEBAAIBBAMBAQEBAAAAAAABESExQQISUXFhgZGxocHw/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAWEQEBAQAAAAAAAAAAAAAAAAAAEQH/2gAMAwEAAhEDEQA/AMriLyCKgg1gQwCgs4FTMOdutepjQak+FzMSVqgxZdRdPPIIvH5WzzGdBriphtTeAXg2ZjKA1pqKDUGZca3foBek8gFv8Ie3fKdA1qb8s7hoL6eLVt51FsAnql3Ut1M7AWbflLMDkEMX/F6/YjK/pADFQAUNA6alYagKk72m/j9p4Bq2fDDSYKLNXPNLoHE/NT6RYC31cJxZ3yWVM+aBYi/S2ZgiAsnYJx5D21vPmqrm3PTfpQQwyAC8JZvSKDni41ZrMuUVVl+Uz9w9v/1QWrZsZ5nFPHYH+JZyureQSF5M+fJ0CAfwRAVRBQA1DAWVUayoJUWoDpsxntPsueBV4+VxhdyAtv8AjOLGpIDMLbeGvbF4iozJfr/WukAVABAXAQXEAAASzVAZdO2WNordm+emFl7XcQSNZiFtv0C9w90nhJf4mA1u+GcJFwIyAqL/AOovwgGNfSRqdIrNa29M0gKCAojU9PAMjWXpckEJFNFEAAXEUBABYz6rZ0ureQc9vyt9XxDF2QAXtABcQAs0AZywkvluJbyipifas52DcyxjlZweAO0xri/hc+wZOEKIu6nSyeToVZyWXwvCg53gW81QQ7aTNAn5dGZJPs1UXURQAUEMCXQLZE93PRZ5hPTgNMrbIzKCm52LZwCs+2M8w2g3sjPuZAXb4IsMAUACzVUGM4/K+md6vEXUUyM5PDR0IxYe6ramih0VNBrS4xoqN8Q1BFQk3yqyAsioioAAKgDSJL4/jQIn5igLrPqtOuf6oOaxbMoAltUAhhIoJiiggrPu+AaOIxtAX3JbaAIaLwi4t9X4T3fg2AFtqcrUUarP20zUDAmqoE0WRBZPNVUVEAAAAVAC8kvih2DSKxOdBqs7Z0l0gI0mKAC4AuHE7ZtBriM+744QAAAAABAFsveIttBICyaikvy1+r/Cen5rWQHIBQa4rIDRqSl5qDWqziqgAAAATA7BpGdqXb2C2+J/UgAtRQBSQtkBWb6vhLbQAAAAAEBRAAAAAUbm+GZNdPxAP+ql2Tjwx7/wIgZ8iKvBk+CJoCXii9gaqZ/qqihAAAEVABGkBFUwBftNkZ3QW34QAAABFAQAVAAAAAARVkl8gs/43sk1jL45LvHArepk+E9XTG35oLqsmIKmLAEygKg0y1AFQBUXwgAAAoBC34S3UAAABAVAAAAAABAUQAVABdRQa1PcYyit2z58M8C4ouM2NXpOEGeWtNZUatiAIoAKIoCoAoG4C9MW6dgIoAIAAAAAAACKWAgL0CAAAALiANCKioNLgM1CrLihmTafkt1EF3SZ5ZVUW4mnIKvAi5fhEURVDWVQBRAAAAAAAAQFRVyAyulgAqCKlF8IqLsEgC9mGoC+IusqCrv5ZEUVOk1RuJfwSLOOkGFi4XPCoYYrNiKauosBGi9ICstM1UAAAAAAFQ0VcTBAXUGgIqGoKhKAzRRUQUAwxoSrGRpkQA/qiosOL9oJptMRRVZa0VUqSiChE6BqMgCwqKqIogAIAqKCKgKoogg0lBFuIKgAAAKNRlf2gqsftsEtZWoAAqAACKoMqAAeSoqp39kL2AqLOlE8rEBFQARYALhigrNC9gGmooLp4TweEQFFBFAECgIoAu0ifIAqAAA//9k=";
const JFIF_BASE64 =
	"/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAIABAADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EAB8QAQEBAQEBAQACAwAAAAAAAAABERJRYSECsTGCof/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAgoCCgIKAgoCCgIKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCCgAAAAAAAAAAAAAAAAAAAAAAAACKAgqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgIKAgoAAAAAAAAAAAACCgIKAgoCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIKAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIKgAAAAAAAAAAAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIAAAAAAAAAAAAAAAAAAAAAACggoCKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIKAgoCCgIKAgoCCgIoAAAAAAAAAAAAAAAAoIKAAAAAAAAAAAAAAAAAgoCCgIAAAAAAAAAAAAAAigIKAgqAAAAAAoIKAgoCCgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCCgAAAAAAAAAAAAAAAqAAAAAAAAAAAAAIoCCgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACggoCCgIKAAAAAAAAIACgigIKAgoCCoAAAAAAAAACggKCAAAAAAAAAAAAAAAACgIoAAAAAAAAoIKAigAAAAAAAAAAAAAAAigIKAgAAAAAAACKAgqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIoAAAAqCCgJiNICAKAAAAAAAKCCgAAAAAAAAAKCKAAAAAACAKAgoCCgIKAgoCCgIKAgAACgAAigIKgAAgAKAAIoCCgIAAAAAAAAAAAAAAAACggoAAAAAAAAAAAAAKAAICKAgoCKAIKAgoCCgIKAgCgAAAAAgKICoAACgigIKAAAAAAAAAAAAACgAAAAACAKAAAAAAAAAAAAAAAAAAAAAIoCCgIAAAoIoCCgIAAAAAAAAACCgIKAgoCCgIoAAAAAAAAAAACgIKAAIAAAAAAAAAAAAAAAAAAAAAAIKAgoCKACAAAoAAAIACgAAAAAAKAigAAgCgIKAgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIKgACgACCgIKgAAAAAAAAAAAAAAAAAAAAAAAoAAgAAAAAAAAAAAAAAAACKKCAKIoACAAAAIAKAAAAAAIKgAAAAAKCKAAAAAKIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKAgoCAAAKAAIKAgoCCoAAgAoIKAgoAAAAAAAADnf8ALUrC7QdBjqp1QdBz2poOmw2OYDps9NnrmA6jntOqDoMbTaDaMdVAb2GxgBvqGxgBvYbGAG9OmAGujr4yA318Tr4yA118OvjIDfXw6YAb6i7HMB0HMB0HNQbGNNoNjG1doNKx1ToGxno6gNDPUXYCibFAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQUBAAAAAAAAAABNxOoDQx18OqDY522poOox0m2g6Dlv1doOgx0mg3LKbHNdBAAAAAAAAAAAAAAAABQEFQAAAAAAAAAAAAAAARQAAAAAAAAAAAAAANXb6gDXVOqyA318OvjADp1Pp1HMB06np1HMBrqnVZAb6OvjADp0dT6wA30dRgB02Gz1zAdNnps9cwHTYbHMIOmw2OYQdNhs9cwg6bPTZ65hB1HLTQdRyXqoOgx0dUGxjqs22g6jkKOo5AOo5AOo4gOw5Gg6jlt9NvtB1HLb6bfQdUY2nVBsY6p0DYzq6Ciamg0iaztBtL/LxgAAAAAAAAAAAAAAABQQUBBQEFAQFBFAAAAQBUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwEGuac/QZVvIuQGP8AX+2s+f8AVUEyeGTxQEyeHM8UBnmef2czxoBnmeHMUBOYZFATIZFATImRpATIZFATIZFATIZFQEyGRQEyGRQEwxUAwwAAAAAAAAAT9P1QGRdQAAAAAAAAAUBBQEFAQUAAAAAP0ARRAUQBUUBBQEFAQVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVAAAAAABcBFVQZxcUAxUAURQFQBRAFAAAAAAEAUQBUAAAAEBUAAAAEBRAAAAQ0FGdX9BRAFEAURAXUAAAAAAAAAAAFEAUQBQAAAQAFEAURQAAAABAF0QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFBRFAAAABRAFEUAAFEAUQBRAFEAUQBRAFEAAAAQFEAAAAAAABAAAFEAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFEUAAFEAUQBQAAAFQBRAFEAUQBRAFEAUQAAAAAEAUQAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUQBRFAAAAAABRAFEAUQBRAFEAUQBRAAAAAAAAAAEBRAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFABRAFEAUAAAAAAAAAAAAAAEBRAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARRAFRQAABFAAAAAAAAAEUAAAQBQAAABABUUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARQAAAAAQFRUAAAAAABRFABAURQRRAUQBUAAFAEAAAFRQAAAAAAAAEVAUAAAARQEUAEUEUAAAAAAAAAAAAAAAAAAAAAEUAABFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFABFBFEBRAAFABAAUAAAQBUVABUAAAAAAAVAFQAAAAAAAAAAAAAAAUAAAAABFAEABQBFQBQQFEAAUEFARUAURQAAAAAABFAAAAAAAAAAAAAAAAAAAAAAAAAAAEUAAAAAAAQBRFAAAEUARQBFARUBRFARQEAAABUAFQAAAFQAAAVAFQAFQAAAAAAAAAAAAAAAAAAABQEUAEAURQBAAFBAAVFQFABFQABQQVAFQABQQABUUEUQFQAAAFEBRFAABAUEFAAAAABFAAAAAAAAARQAAAAAAAQBQAAQFAAAAAABAVFQAABQARQEABRAAAAAAAAVAVABUVABUAAAAAAAAAAAAAFQAFBFQAVAAAAAAAAAFRUBUAAVABQEAAABUUBAUEABUFBAAFRQAQAAAFAQAAAFQAVAFEUBBQQVABQEFAEAAUBBQEFAAAAAEUAAAAAAAAAQUAABAAVFAAAAAABAAVFARUAFRQQFBBQEAABQQUBBUABQQAAABUUBFQFQAAAAUBFQAAFRUAAAFQFAAEAAAAAFRQEABUAVBQEVABUAAAAAAAFQFRUAFQBUAFQBUAAUARQEVFBFRQEFABAUEBRFBFEAVFAEUAAEVFAEAUAEUAQVAVAAABUAFBABQAQAVAAAAUBFAEABRFAEAAAAAAAAAAAAAFQAAAVABUAVAAAAAABQQAAAFQAAAFQAAABQQABUAAAUQAFQAFBFAEAAAABQQUBBUAVAFQAVFAEVAAABQEFAQAAUBFQAAABQQUBFQAVAFBAUEAABRAAVABUAABUAFEAAAAAAAAAAAFQAVAAVAAUEAABQRQBBQBFQBRAAAAAAAFRQQVAAAUQAAAAAFQFQAVAAAAFQAUBAAFQAAAABRFAQAAAUQBUAAUBFEAVAFQAAABQEFARRAUQBUAAAAAAVAVFQAAFRUBUFAEAVAAAAFAQUBAABUAUQAAAAAAAAAAFEAAAFQBRAFQAAAFQBUVAAUEAABQBAAAAAAAAAAFBAUEVAF0QAVAFQUBAAABRFBBQEVAAUBAAAAAAAAAAFQBUABUAAAVAAAAFAEFBAUAQAABUVABQEUAQUBFEABQRRAVAAAAUQAFBFAEFAQVAVAAVAAAAAAAAAAAAAAAAAAABUAUQBUAAABUAAAAAAAAAFQBUAAAAX8PwED8AAAAAVAAABRAFQAAAFQAAAAAAAAAAAAAAAAAVAFEAFQBRAAAAAAAAVAAAUQBRAAABUAAAAABQEBQQUBAAAAAAAAAAAAAAf/2Q==";
const PNG_BASE64 =
	"data:file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=";
const PDF_BASE64 =
	"JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCBUZAogICAgKEhlbGxvIFdvcmxkKSBUagogIEVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDc3IDAwMDAwIG4gCjAwMDAwMDAxNzggMDAwMDAgbiAKMDAwMDAwMDQ1NyAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgIC9Sb290IDEgMCBSCiAgICAgIC9TaXplIDUKICA+PgpzdGFydHhyZWYKNTY1CiUlRU9GCg==";

const generateSchema = (validation) => {
	return jsonToSchema({
		section: {
			uiType: "section",
			children: {
				field: {
					uiType: "file-upload",
					uploadOnAddingFile: { type: "base64" },
					validation,
				},
			},
		},
	});
};

describe("file-upload", () => {
	it("should be able to generate a validation schema", async () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "file-upload",
						somethingUnused: "test",
						uploadOnAddingFile: { type: "base64" },
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(
			async () =>
				await schema.validate({
					field: [{ fileName: FILENAME, dataURL: JPG_BASE64 }],
				})
		).not.toThrowError();

		expect((await TestHelper.getAsyncError(() => schema.validate({}))).message).toBe(ERROR_MESSAGE);
		expect((await TestHelper.getAsyncError(() => schema.validate({ field: [] }))).message).toBe(ERROR_MESSAGE);
	});

	describe.each`
		rule             | ruleValue  | valid           | invalid                     | errorMessage
		${"maxSizeInKb"} | ${1}       | ${[JPG_BASE64]} | ${[JPG_1KB_BASE64]}         | ${ERROR_MESSAGES.UPLOAD().MAX_FILE_SIZE(1)}
		${"max"}         | ${1}       | ${[JPG_BASE64]} | ${[JPG_BASE64, JPG_BASE64]} | ${ERROR_MESSAGES.UPLOAD().MAX_FILES(1)}
		${"length"}      | ${1}       | ${[JPG_BASE64]} | ${[JPG_BASE64, JPG_BASE64]} | ${ERROR_MESSAGES.UPLOAD().MAX_FILES(1)}
		${"fileType"}    | ${["jpg"]} | ${[JPG_BASE64]} | ${[PNG_BASE64]}             | ${ERROR_MESSAGES.UPLOAD().FILE_TYPE(["jpg"])}
		${"fileType"}    | ${["pdf"]} | ${[PDF_BASE64]} | ${[JPG_1KB_BASE64]}         | ${ERROR_MESSAGES.UPLOAD().FILE_TYPE(["pdf"])}
	`("$rule rule", ({ rule, ruleValue, valid, invalid, errorMessage }) => {
		let schema: Yup.ObjectSchema<ObjectShape>;

		beforeEach(() => {
			jest.restoreAllMocks();
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "file-upload",
							uploadOnAddingFile: { type: "base64" },
							validation: [{ [rule]: ruleValue, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
		});

		it("should accept if submitted value fulfills criteria", () => {
			expect(
				async () =>
					await schema.validate({
						field: valid.map((file) => ({ fileName: FILENAME, dataURL: file })),
					})
			).not.toThrowError();
		});

		it("should reject if submitted value does not fulfill criteria", async () => {
			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: invalid.map((file) => ({ fileName: FILENAME, dataURL: file })),
						})
					)
				).message
			).toBe(ERROR_MESSAGE);
		});

		it("should use default error message if error message is not specified", async () => {
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "file-upload",
							uploadOnAddingFile: { type: "base64" },
							validation: [{ [rule]: ruleValue }],
						},
					},
				},
			});

			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: invalid.map((file) => ({ fileName: FILENAME, dataURL: file })),
						})
					)
				).message
			).toBe(errorMessage);
		});
	});

	describe("file-extension", () => {
		let schema: Yup.ObjectSchema<ObjectShape>;

		beforeEach(() => {
			jest.restoreAllMocks();
		});

		it.each`
			acceptedFileTypes                | files                                                                                                 | acceptedFileExtensions
			${["jpg"]}                       | ${[{ fileName: FILENAME, dataURL: JPG_BASE64 }]}                                                      | ${["jpg"]}
			${["jpg", "jpeg", "pdf", "png"]} | ${[{ fileName: FILENAME, dataURL: JPG_BASE64 }, { fileName: "hello.jpeg", dataURL: JPG_1KB_BASE64 }]} | ${["JPG", "JPEG"]}
		`(
			"should accept the expected file extensions",
			async ({ acceptedFileTypes, files, acceptedFileExtensions }) => {
				const validation = [{ fileType: acceptedFileTypes }, { fileExtension: acceptedFileExtensions }];

				schema = generateSchema(validation);
				expect(
					async () =>
						await schema.validate({
							field: files,
						})
				).not.toThrowError();
			}
		);

		it("should reject files without expected file extensions", async () => {
			const validation = [{ fileType: ["pdf"] }, { fileExtension: ["pdf"] }];

			const files = [
				{ fileName: "without-extension", dataURL: JPG_BASE64 },
				{ fileName: `${FILENAME}.pdf`, dataURL: PDF_BASE64 },
			];
			schema = generateSchema(validation);

			const result = await TestHelper.getAsyncError(() =>
				schema.validate(
					{
						field: files,
					},
					{ abortEarly: false }
				)
			);

			expect(result.errors.length).toEqual(2);
			expect(result.errors.includes(ERROR_MESSAGES.UPLOAD().FILE_TYPE(["pdf"]))).toEqual(true);
			expect(result.errors.includes(ERROR_MESSAGES.UPLOAD().FILE_EXTENSION(["pdf"]))).toEqual(true);
		});

		it.each`
			acceptedFileTypes | acceptedFileExtensions
			${["jpg"]}        | ${["jpg"]}
			${["jpg"]}        | ${["JPEG"]}
		`(
			"should reject files if not explicitly included in accepted file extensions",
			async ({ acceptedFileTypes, acceptedFileExtensions }) => {
				const validation = [{ fileType: acceptedFileTypes }, { fileExtension: acceptedFileExtensions }];

				const files = [
					{ fileName: "hello.jpeg", dataURL: JPG_1KB_BASE64 }, // passes fileType check, but fails first fileExtension check
					{ fileName: FILENAME, dataURL: JPG_BASE64 }, // passes fileType check, but fails second fileExtension check
				];
				schema = generateSchema(validation);

				const result = await TestHelper.getAsyncError(() =>
					schema.validate(
						{
							field: files,
						},
						{ abortEarly: false }
					)
				);

				expect(result.errors.length).toEqual(1);
				expect(result.errors.includes(ERROR_MESSAGES.UPLOAD().FILE_EXTENSION(acceptedFileExtensions))).toEqual(
					true
				);
			}
		);

		it("should print the correct default error message", async () => {
			const acceptedFileTypes = ["jpg", "jpeg", "pdf", "png"];

			const validation = [
				{ fileType: acceptedFileTypes, errorMessage: ERROR_MESSAGE },
				{ fileExtension: acceptedFileTypes },
			];

			const files = [
				{ fileName: FILENAME, dataURL: JPG_BASE64 },
				{ fileName: "invalid.jiff", dataURL: JFIF_BASE64 },
			];
			schema = generateSchema(validation);
			const result = await TestHelper.getAsyncError(() =>
				schema.validate(
					{
						field: files,
					},
					{ abortEarly: false }
				)
			);

			expect(result.errors.length).toEqual(1);
			expect(result.errors.includes(ERROR_MESSAGES.UPLOAD().FILE_EXTENSION(acceptedFileTypes))).toEqual(true);
		});

		it("should allow default errorMessage to be overriden", async () => {
			const validation = [{ fileType: ["jpg"] }, { fileExtension: ["jpg"], errorMessage: ERROR_MESSAGE }];

			const files = [
				{ fileName: FILENAME, dataURL: JPG_BASE64 },
				{ fileName: "without-extension", dataURL: JPG_BASE64 },
			];
			schema = generateSchema(validation);
			const result = await TestHelper.getAsyncError(() =>
				schema.validate(
					{
						field: files,
					},
					{ abortEarly: false }
				)
			);

			expect(result.errors.includes(ERROR_MESSAGE)).toEqual(true);
		});

		it("should not validate extensions without accepted file extensions", async () => {
			const validation = [{ fileExtension: ["jpg"], errorMessage: ERROR_MESSAGE }];

			const files = [
				{ fileName: FILENAME, dataURL: JPG_BASE64 },
				{ fileName: "without-extension", dataURL: JPG_BASE64 },
			];
			schema = generateSchema(validation);

			expect(
				async () =>
					await schema.validate({
						field: files,
					})
			).not.toThrowError();
		});
	});

	describe("submitted values", () => {
		it("should reject for base64 uploads if submitted values do not contain dataURL", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "file-upload",
							somethingUnused: "test",
							uploadOnAddingFile: { type: "base64" },
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
			expect(
				async () => await schema.validate({ field: [{ fileName: FILENAME, dataURL: JPG_1KB_BASE64 }] })
			).not.toThrowError();
			expect(
				(await TestHelper.getAsyncError(() => schema.validate({ field: [{ fileName: FILENAME }] }))).message
			).toBe(ERROR_MESSAGES.UPLOAD().INVALID);
		});

		it("should accept for multipart uploads even when fileUrl is not provided", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "file-upload",
							somethingUnused: "test",
							uploadOnAddingFile: { type: "multipart" },
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});
			expect(
				async () => await schema.validate({ field: [{ fileName: FILENAME, fileUrl: "https://www.test.tld" }] })
			).not.toThrowError();
			expect(async () => await schema.validate({ field: [{ fileName: FILENAME }] })).not.toThrowError();
		});

		it("should reject for multipart uploads if submitted values contains dataURL", async () => {
			const schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "file-upload",
							somethingUnused: "test",
							uploadOnAddingFile: { type: "multipart" },
							validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
						},
					},
				},
			});

			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: [{ fileName: FILENAME, fileUrl: "https://www.test.tld", dataURL: "mock" }],
						})
					)
				).message
			).toBe(ERROR_MESSAGES.UPLOAD().INVALID);
		});
	});
});
