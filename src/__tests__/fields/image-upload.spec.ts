import { jsonToSchema } from "../../schema-generator";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";
import { ERROR_MESSAGES } from "../../shared";
import { TestHelper } from "../../utils";
import { ERROR_MESSAGE } from "../common";

const FILENAME = "hello.jpg";
const JPG_BASE64 =
	"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";
const JPG_1KB_BASE64 =
	"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCADqATkDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACQQAQEBAAIBBAMBAQEBAAAAAAABESExQQISUXFhgZGxocHw/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAWEQEBAQAAAAAAAAAAAAAAAAAAEQH/2gAMAwEAAhEDEQA/AMriLyCKgg1gQwCgs4FTMOdutepjQak+FzMSVqgxZdRdPPIIvH5WzzGdBriphtTeAXg2ZjKA1pqKDUGZca3foBek8gFv8Ie3fKdA1qb8s7hoL6eLVt51FsAnql3Ut1M7AWbflLMDkEMX/F6/YjK/pADFQAUNA6alYagKk72m/j9p4Bq2fDDSYKLNXPNLoHE/NT6RYC31cJxZ3yWVM+aBYi/S2ZgiAsnYJx5D21vPmqrm3PTfpQQwyAC8JZvSKDni41ZrMuUVVl+Uz9w9v/1QWrZsZ5nFPHYH+JZyureQSF5M+fJ0CAfwRAVRBQA1DAWVUayoJUWoDpsxntPsueBV4+VxhdyAtv8AjOLGpIDMLbeGvbF4iozJfr/WukAVABAXAQXEAAASzVAZdO2WNordm+emFl7XcQSNZiFtv0C9w90nhJf4mA1u+GcJFwIyAqL/AOovwgGNfSRqdIrNa29M0gKCAojU9PAMjWXpckEJFNFEAAXEUBABYz6rZ0ureQc9vyt9XxDF2QAXtABcQAs0AZywkvluJbyipifas52DcyxjlZweAO0xri/hc+wZOEKIu6nSyeToVZyWXwvCg53gW81QQ7aTNAn5dGZJPs1UXURQAUEMCXQLZE93PRZ5hPTgNMrbIzKCm52LZwCs+2M8w2g3sjPuZAXb4IsMAUACzVUGM4/K+md6vEXUUyM5PDR0IxYe6ramih0VNBrS4xoqN8Q1BFQk3yqyAsioioAAKgDSJL4/jQIn5igLrPqtOuf6oOaxbMoAltUAhhIoJiiggrPu+AaOIxtAX3JbaAIaLwi4t9X4T3fg2AFtqcrUUarP20zUDAmqoE0WRBZPNVUVEAAAAVAC8kvih2DSKxOdBqs7Z0l0gI0mKAC4AuHE7ZtBriM+744QAAAAABAFsveIttBICyaikvy1+r/Cen5rWQHIBQa4rIDRqSl5qDWqziqgAAAATA7BpGdqXb2C2+J/UgAtRQBSQtkBWb6vhLbQAAAAAEBRAAAAAUbm+GZNdPxAP+ql2Tjwx7/wIgZ8iKvBk+CJoCXii9gaqZ/qqihAAAEVABGkBFUwBftNkZ3QW34QAAABFAQAVAAAAAARVkl8gs/43sk1jL45LvHArepk+E9XTG35oLqsmIKmLAEygKg0y1AFQBUXwgAAAoBC34S3UAAABAVAAAAAABAUQAVABdRQa1PcYyit2z58M8C4ouM2NXpOEGeWtNZUatiAIoAKIoCoAoG4C9MW6dgIoAIAAAAAAACKWAgL0CAAAALiANCKioNLgM1CrLihmTafkt1EF3SZ5ZVUW4mnIKvAi5fhEURVDWVQBRAAAAAAAAQFRVyAyulgAqCKlF8IqLsEgC9mGoC+IusqCrv5ZEUVOk1RuJfwSLOOkGFi4XPCoYYrNiKauosBGi9ICstM1UAAAAAAFQ0VcTBAXUGgIqGoKhKAzRRUQUAwxoSrGRpkQA/qiosOL9oJptMRRVZa0VUqSiChE6BqMgCwqKqIogAIAqKCKgKoogg0lBFuIKgAAAKNRlf2gqsftsEtZWoAAqAACKoMqAAeSoqp39kL2AqLOlE8rEBFQARYALhigrNC9gGmooLp4TweEQFFBFAECgIoAu0ifIAqAAA//9k=";
const PNG_BASE64 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=";

describe("image-upload", () => {
	it("should be able to generate a validation schema", async () => {
		const schema = jsonToSchema({
			section: {
				uiType: "section",
				children: {
					field: {
						uiType: "image-upload",
						somethingUnused: "test",
						validation: [{ required: true, errorMessage: ERROR_MESSAGE }],
					},
				},
			},
		});
		expect(
			async () =>
				await schema.validate({
					field: [
						{
							fileName: FILENAME,
							dataURL: JPG_BASE64,
						},
					],
				})
		).not.toThrowError();

		expect((await TestHelper.getAsyncError(() => schema.validate({}))).message).toBe(ERROR_MESSAGE);
		expect((await TestHelper.getAsyncError(() => schema.validate({ field: [] }))).message).toBe(ERROR_MESSAGE);
	});

	describe.each`
		rule             | ruleValue | valid           | invalid                     | errorMessage
		${"maxSizeInKb"} | ${1}      | ${[JPG_BASE64]} | ${[JPG_1KB_BASE64]}         | ${ERROR_MESSAGES.UPLOAD("photo").MAX_FILE_SIZE(1)}
		${"max"}         | ${1}      | ${[JPG_BASE64]} | ${[JPG_BASE64, JPG_BASE64]} | ${ERROR_MESSAGES.UPLOAD("photo").MAX_FILES(1)}
		${"length"}      | ${1}      | ${[JPG_BASE64]} | ${[JPG_BASE64, JPG_BASE64]} | ${ERROR_MESSAGES.UPLOAD("photo").MAX_FILES(1)}
	`("$rule rule", ({ rule, ruleValue, valid, invalid, errorMessage }) => {
		let schema: Yup.ObjectSchema<ObjectShape>;

		beforeEach(() => {
			jest.restoreAllMocks();
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "image-upload",
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
						field: valid.map((image) => ({
							fileName: FILENAME,
							dataURL: image,
						})),
					})
			).not.toThrowError();
		});

		it("should reject if submitted value does not fulfill criteria", async () => {
			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: invalid.map((image) => ({
								fileName: FILENAME,
								dataURL: image,
							})),
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
							uiType: "image-upload",
							validation: [{ [rule]: ruleValue }],
						},
					},
				},
			});

			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: invalid.map((image) => ({
								fileName: FILENAME,
								dataURL: image,
							})),
						})
					)
				).message
			).toBe(errorMessage);
		});
	});

	describe.each`
		scenario            | prop                                                         | valid         | invalid           | errorMessage
		${"dimensions"}     | ${{ compress: true, dimensions: { width: 10, height: 10 } }} | ${JPG_BASE64} | ${JPG_1KB_BASE64} | ${ERROR_MESSAGES.UPLOAD("photo").DIMENSIONS(10, 10)}
		${"outputType=jpg"} | ${{ outputType: "jpg" }}                                     | ${JPG_BASE64} | ${PNG_BASE64}     | ${ERROR_MESSAGES.UPLOAD("photo").FILE_TYPE(["jpg"])}
		${"outputType=png"} | ${{ outputType: "png" }}                                     | ${PNG_BASE64} | ${JPG_BASE64}     | ${ERROR_MESSAGES.UPLOAD("photo").FILE_TYPE(["png"])}
	`("$scenario", ({ prop, valid, invalid, errorMessage }) => {
		let schema: Yup.ObjectSchema<ObjectShape>;

		beforeEach(() => {
			jest.restoreAllMocks();
			schema = jsonToSchema({
				section: {
					uiType: "section",
					children: {
						field: {
							uiType: "image-upload",
							...prop,
						},
					},
				},
			});
		});

		it("should accept if submitted value fulfills criteria", () => {
			expect(
				async () =>
					await schema.validate({
						field: [
							{
								fileName: FILENAME,
								dataURL: valid,
							},
						],
					})
			).not.toThrowError();
		});

		it("should reject if submitted value does not fulfill criteria", async () => {
			expect(
				(
					await TestHelper.getAsyncError(() =>
						schema.validate({
							field: [
								{
									fileName: FILENAME,
									dataURL: invalid,
								},
							],
						})
					)
				).message
			).toBe(errorMessage);
		});
	});
});
