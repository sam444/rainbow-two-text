import { UIDialog, Param, UIDataTable, UIBox, UIColumn, UIButton, OnChangeEvent, CodeTable, UIMessageHelper, KeyValue, Validator } from "rainbowui-core";
import { Util } from "rainbow-foundation-tools";
import r18n from "../i18n/reactjs-tag.i18n"
import config from "config";
import "../css/twotext.css";
import PropTypes from 'prop-types';
import { CodeTableService } from "rainbow-foundation-codetable";

export default class TwoText extends KeyValue {

	constructor(props) {
		super(props);
		this.state = {
			filterTable: [],
			dialogShowing: false,
			dialogDataFlag: false,
			dialogData: []
		}
	}



	componentDidMount() {
		super._componentDidMount();

		this.initValue()

	}


	componentDidUpdate(nextProps, nextState) {
		if (Util.parseBool(this.props.hiddenCode)) {
			$("#" + this.componentId + "_code").hide();
		}

		this.initValue()
	}



	componentWillMount() {
		super._componentWillMount();
		this.getCodeTableData();
	}

	componentWillReceiveProps(nextProps) {

		this.clearValidationInfo(nextProps);
		this.props.value = nextProps.value
		this.props.CodeTableName = nextProps.CodeTableName

		let { codeTableId, codeTableName, conditionMap } = nextProps;
		if (this.props.codeTableId == codeTableId && this.props.codeTableName == codeTableName && this.props.conditionMap == conditionMap) {

		} else {
			this.props.codeTableId = codeTableId;
			this.props.codeTableName = codeTableName;
			this.props.conditionMap = conditionMap;
			this.getCodeTableData();
		}
	}


	renderInput() {
		let inputRef = this.getInputRefProperty();
		let textBoxClass = "col-sm-6 col-md-6 col-lg-6";
		let codeBoxClass = "col-sm-6 col-md-6 col-lg-6";
		let codeBoxDisplay = "flex";
		if (Util.parseBool(this.props.hiddenCode)) {
			textBoxClass = "col-sm-12 col-md-12 col-lg-12";
			codeBoxDisplay = "none";
		}
		let ioInSign = this.props.io == "in";
		if (this.state.dialogDataFlag) {
			if (ioInSign) {
				return (
					<div className="twoText input-group" id={this.componentId} name={this.getName()} required={this.props.required} >
						<div className="input-group col-sm-12 col-md-12 col-lg-12">
							<div id={this.componentId + "_code"} className={codeBoxClass} style={{ display: codeBoxDisplay }}>
								<input id={this.componentId + "_code_"} type="text" className="form-control" placeholder={this.props.placeHolder}
									ref={inputRef} data-auto-test={this.getNameForTest()} onKeyUp={this.inputKeyup.bind(this)} onBlur={Util.parseBool(this.props.onBlurEnable) ? this.inputBlur.bind(this) : null} disabled={Util.parseBool(this.props.enabled) ? null : "disabled"} />
							</div>
							<div className={textBoxClass} >
								<input id={this.componentId + "_value"} name={this.componentId + "_value"} type="text"
									className="form-control" placeholder={this.props.placeHolder} data-auto-test={this.getNameForTest() + "_value"} onKeyUp={this.valueKeyUp.bind(this)} disabled={Util.parseBool(this.props.valueToCode) && Util.parseBool(this.props.enabled) ? null : "disabled"} onBlur={Util.parseBool(this.props.onBlurEnable) ? this.valueBlur.bind(this) : null} />
							</div>
							<span className="input-group-addon fixalliconposition"
								onClick={this.onShowSearchCodeTableDialog.bind(this)}>
								<span className="glyphicon glyphicon-search" />
							</span>
						</div>
						{this.renderSearchCodeTableDialog()}
					</div>
				);

			}
			else {
				return (
					<div className="twoText" id={this.componentId} name={this.getName()}>
						<div className="input-group col-sm-12 col-md-12 col-lg-12">
							<div id={this.componentId + "_code"} className="col-sm-6 col-md-6 col-lg-6">
								<input id={this.componentId + "_code_"} type="text" className="form-control" placeholder={this.props.placeHolder}
									ref={inputRef} data-auto-test={this.getNameForTest()} disabled="disabled" />
							</div>
							<div className={textBoxClass} >
								<input id={this.componentId + "_value"} name={this.componentId + "_value"} type="text"
									className="form-control" placeholder={this.props.placeHolder} data-auto-test={this.getNameForTest() + "_value"} disabled="disabled" />
							</div>
							<span className="input-group-addon fixalliconposition"
								onClick={this.onShowSearchCodeTableDialog.bind(this)}>
								<span className="glyphicon glyphicon-search" />
							</span>
						</div>
						{this.renderSearchCodeTableDialog()}
					</div>);

			}
		}
	}

	renderSearchCodeTableDialog() {
		let searchDialog = $.extend({}, {
			// dialogTitle: r18n.dialogTitle,
			keyColumn: r18n.keyColumn,
			valueColumn: r18n.valueColumn,
		}, this.props.searchDialog);
		return (
			<UIDialog noI18n id={this.componentId + "_SearchCodeTableDialog"} width="85%" onClose={this.onCloseCodeTableDialog.bind(this)}>
				<UIDataTable id={this.componentId + "_SearchCodeTableDataTable"} value={this.state.dialogData} selectionMode="single"
					searchable={this.props.searchable} headable="false">
					{this.getDataTableColumn(searchDialog)}
				</UIDataTable>
				<UIBox direction={this.props.footerDirection}>
					<UIButton noI18n="true" value={r18n.confirm} styleClass="primary" onClick={this.onSubmitCodeTable.bind(this)} />
					<UIButton noI18n="true" value={r18n.cancel} styleClass="primary" onClick={this.onCancelCodeTableDialog.bind(this)} />
				</UIBox>
			</UIDialog>
		)
	}

	getCodeTableData() {
		let _self = this;
		let { codeTableId, codeTableName, conditionMap } = _self.props;
		if (codeTableId) {
			CodeTableService.getCodeTable({ "CodeTableId": codeTableId, "ConditionMap": conditionMap }).then(function (data) {
				_self.props.dataSource = _self.handCodeTableData(data)
				_self.initCodeTableExtend();
			});
		} else if (codeTableName) {
			CodeTableService.getCodeTable({ "CodeTableName": codeTableName, "ConditionMap": conditionMap }).then(function (data) {
				_self.props.dataSource = _self.handCodeTableData(data);
				_self.initCodeTableExtend();
			});
		}
		else {
			this.initCodeTableExtend();
		}
	}

	handCodeTableData(data) {
		let { codeKey, textKey } = this.props;
		let dataArray = [];
		const codetable_key = config["DEFAULT_CODETABLE_KEYVALUE"]["KEY"];
		const codetable_value = config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"];
		const codetable_api_key = config["DEFAULT_API_CODETABLE_KEYVALUE"]["KEY"];
		const codetable_api_value = config["DEFAULT_API_CODETABLE_KEYVALUE"]["VALUE"];
		if (data && data.codes && data.codes.length > 0) {
			data.codes.forEach(function (codeItem) {
				const code = {};
				code[codeKey] = codeItem[codetable_key];
				code[textKey] = codeItem[codetable_value];
				dataArray.push(code);
			});
		} if (data && data.BusinessCodeTableValueList && data.BusinessCodeTableValueList.length > 0) {
			data.BusinessCodeTableValueList.forEach(function (codeItem) {
				const code = {};
				code[codeKey] = codeItem[codetable_api_key];
				code[textKey] = codeItem[codetable_api_value];
				dataArray.push(code);
			});
		} else if (Util.isArray(data)) {
			data.forEach(function (codeItem) {
				const code = {};
				code[codeKey] = codeItem[codetable_api_key];
				code[textKey] = codeItem[codetable_api_value];
				dataArray.push(code);
			});
		}
		return dataArray;
	}

	initCodeTable() {

	}

	clearValidationInfo(nextProps) {
		const inputObject = $("#" + this.componentId);
		let codeValue = $('#' + this.componentId + "_code_").val()
		let codeText = $('#' + this.componentId + "_value").val()
		if (Util.parseBool(nextProps.required) && codeValue && codeText) {
			inputObject.parent().next().remove()
			const errorInputObject = inputObject.closest(".form-group");
			if (errorInputObject.hasClass("has-error")) {
				// inputObject.closest(".form-group").css("border", "2px solid #E1E8EE");
				inputObject.closest(".form-group").children(".input-required").children(".twoText").css("border", "2px solid #E1E8EE");
			};
		}
	}

	initCodeTableExtend() {
		let dataSource = this.initDataSource();
		if (dataSource && dataSource.column
			&& dataSource.codeTable && dataSource.tableData) {
			this.codeTable = dataSource.codeTable;
			this.dataSource = dataSource;

			this.setState({ dialogDataFlag: true });
			if (this.props.io != "out") {
				this.initEvent();
				$("#" + this.componentId + "_code_").unbind("change")
				$("#" + this.componentId).unbind("change")
				this.initProperty();
				this.setProperty();
				this.initValidator();
				// PageContext.put(this.componentId + "_twotext", this);
			}
		} else {
			this.codeTable = dataSource;
			this.setState({ dialogDataFlag: true });

		}
	}

	initDataSource() {
		let { dataSource, valueToCode, codeKey, textKey } = this.props;
		if (Util.isString(dataSource)) {
			dataSource = eval(dataSource);
		} else if (Util.isFunction(dataSource)) {
			dataSource = dataSource();
		} else {
			dataSource = dataSource;
		}
		let id = '', text = '', columnArray = [], codeTableArray = [];// valueTableArray =[];
		if (dataSource && dataSource.layout && dataSource.data) {
			let data = dataSource.data;
			let layout = dataSource.layout;
			for (let i in layout) {
				let layoutObj = layout[i];
				if (layoutObj.role == codeKey) {
					id = layoutObj.value;
				} else if (layoutObj.role == textKey) {
					text = layoutObj.value;
				}
				columnArray[i] = { title: layoutObj.title, value: layoutObj.value };
			}
			for (let i in data) {
				let dataObj = data[i];
				codeTableArray[i] = { id: dataObj[id], text: dataObj[text] };
			}
			return { key: id, column: columnArray, codeTable: (new CodeTable(codeTableArray)), tableData: data };
		} else if (dataSource) {
			if (Object.prototype.toString.call(dataSource) === "[object Array]") {
				if (dataSource.length > 0) {
					let sourceObj = dataSource[0]
					let keyArr = Object.keys(dataSource[0])
					for (let i = 0; i < keyArr.length; i++) {
						columnArray[i] = { title: keyArr[i], value: keyArr[i] };
					}
				}
				id = codeKey;
				return { key: id, column: columnArray, codeTable: (new CodeTable(dataSource)), tableData: dataSource };
			}
		}
		return null;
	}

	inputKeyup(event) {
		if (event.key === 'Enter') {

			let codeTable = this.codeTable.getMap();
			let keyValue = event.target.value
			if (codeTable[event.target.value] == undefined) {
				$("#" + this.componentId + "_code_").val("");
				$("#" + this.componentId + "_value").val("");
				// this.setComponentValue("");
			} else {
				let keyText = codeTable[event.target.value][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]]
				$("#" + this.componentId + "_value").val(keyText);

				this.props.value = keyValue;

				if (this.props.model && this.props.property) {
					this.props.model[this.props.property] = keyValue
				}
				if (this.props.model && this.props.propertyText) {
					this.props.model[this.props.propertyText] = keyText
				}
				// this.setComponentValue(keyValue);
				this.clearValidationInfo(this.props)

				if (this.props.onTwoTextChange) {
					this.props.onTwoTextChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
				} else if (this.props.onChange) {
					this.props.onChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
				}

			}
		} else if (event.key === 'Backspace' || event.key === 'Delete') {
			if (event.target.value == "") {
				$("#" + this.componentId + "_value").val("");

				if (this.props.model && this.props.property) {
					this.props.model[this.props.property] = ""
				}
				if (this.props.model && this.props.propertyText) {
					this.props.model[this.props.propertyText] = ""
				}

				if (this.props.onTwoTextChange) {
					this.props.onTwoTextChange(new OnChangeEvent(this, event, Param.getParameter(this), ""), "");
				} else if (this.props.onChange) {
					this.props.onChange(new OnChangeEvent(this, event, Param.getParameter(this), ""), "");
				}
			}
		}
		$("#" + this.componentId).val($("#" + this.componentId + "_value").val());
	}

	inputBlur(event) {
		event.preventDefault();
		let codeTable = this.codeTable.getMap();
		let keyValue = event.target.value
		if (codeTable[event.target.value] == undefined) {
			$("#" + this.componentId + "_code_").val("");
			$("#" + this.componentId + "_value").val("");
			// this.setComponentValue("");
		} else {
			let keyText = codeTable[event.target.value][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]]
			$("#" + this.componentId + "_value").val(keyText);


			this.props.value = keyValue;


			if (this.props.model && this.props.property) {
				this.props.model[this.props.property] = keyValue
			}
			if (this.props.model && this.props.propertyText) {
				this.props.model[this.props.propertyText] = keyText
			}

			// this.setComponentValue(keyValue);

			this.clearValidationInfo(this.props)
			if (this.props.onTwoTextChange) {
				this.props.onTwoTextChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);

			} else if (this.props.onChange) {
				this.props.onChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
			}

		}
		$("#" + this.componentId).val($("#" + this.componentId + "_value").val());
	}

	valueKeyUp(event) {
		if (!Util.parseBool(this.props.valueToCode)) {
			return
		}
		if (event.key === 'Enter') {
			let editValue = event.target.value;
			this.findCodeByInputText(editValue)

		}
		else if (event.key === 'Backspace' || event.key === 'Delete') {
			if (event.target.value == "") {
				$("#" + this.componentId + "_code_").val("");
				if (this.props.model && this.props.property) {
					this.props.model[this.props.property] = ""
				}
				if (this.props.model && this.props.propertyText) {
					this.props.model[this.props.propertyText] = ""
				}
			}
		}
	}

	valueBlur(event) {

		let { codeKey, textKey } = this.props;
		if (!Util.parseBool(this.props.valueToCode)) {
			return
		}

		let editValue = event.target.value;
		if (event.target.value != "") {
			this.findCodeByInputText(editValue)
		}
		else {

			$("#" + this.componentId).val("")
			// this.setComponentValue("")
		}

		// let editCode = $("#" + this.componentId + "_code_").val()
		// if ($("#" + this.componentId + "_code_").val() != "") {
		// 	let codeResult = this.codeTable.codes.filter(function (ele, index, ar) {
		// 		if (ele[codeKey] == editCode) {
		// 			return true;
		// 		} else {
		// 			return false;
		// 		}
		// 	});
		// 	if (codeResult.length == 1) {
		// 		event.target.value = codeResult[0][textKey]
		// 		return
		// 	}
		// }
		// if (editValue.length > this.props.valueBlurMatchLength) {
		// 	this.findCodeByInputText(editValue)
		// }
		// else if (editValue.length === this.props.valueBlurMatchLength) {

		// 	$("#" + this.componentId).val($("#" + this.componentId + "_code_").val());
		// }

	}

	getOutputValue() {
		let codeTable = this.codeTable;
		if (codeTable) {
			let codeTableMap = this.codeTable.getMap();
			let key = $('#' + this.componentId + "_code_").val()
			let value = (codeTableMap[key] != undefined) ? codeTableMap[key][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]] : null;
			key = (key != null && key != undefined) ? key : "";
			value = (value != null && value != undefined) ? value : "";
			return key + " " + value;
		}
	}

	allSourceData() {
		let tableData = []
		let dataSource = this.dataSource;
		let codeTable = this.codeTable.getMap();
		if (dataSource && dataSource.tableData) {
			tableData = dataSource.tableData;
		} else if (codeTable) {
			$.each(codeTable, function (index, element) {
				tableData.push({
					key: element[config["DEFAULT_CODETABLE_KEYVALUE"]["KEY"]],
					value: element[config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]]
				});
			});
		}
		return tableData;
	}

	getDataTableData(event) {
		let tableData = [];
		if (event == null) {
			if (this.state.filterTable.length == 0) {
				tableData = this.allSourceData()
			} else {
				tableData = this.state.filterTable;
			}
		} else {
			tableData = this.allSourceData();
		}
		if (tableData.length == 0) {
			tableData = new CodeTable(tableData)
		}
		this.setState({ dialogData: tableData });
	}

	getDataTableColumn(searchDialog) {
		let tableColumn = [];
		let dataSource = this.dataSource;
		let codeTable = this.codeTable.getMap();
		if (dataSource && dataSource.column) {
			let columnArray = dataSource.column;
			for (let i in columnArray) {
				tableColumn.push(<UIColumn headerTitle={columnArray[i]['title']} value={columnArray[i]['value']} />);
			}
		} else if (codeTable) {
			tableColumn.push(<UIColumn noI18n headerTitle={searchDialog.keyColumn} value="key" />);
			tableColumn.push(<UIColumn noI18n headerTitle={searchDialog.valueColumn} value="value" />);
		}
		if (tableColumn.length == 0) {
			tableColumn.push(<UIColumn noI18n headerTitle={searchDialog.keyColumn} value="key" />);
			tableColumn.push(<UIColumn noI18n headerTitle={searchDialog.valueColumn} value="value" />);
		}
		return tableColumn;
	}

	initDisabled() {
		// let disabled = this.getDisabled()
		// $("#" + this.componentId).attr("disabled", disabled);
		// if (disabled) {
		//     if (Util.parseBool(this.props.valueToCode)) {
		//         $("#" + this.componentId + "_value").attr("disabled", "disabled");
		//     }
		//     else {
		//         $("#" + this.componentId + "_value").removeAttr("disabled");
		//     }
		// }else{
		//     $("#" + this.componentId + "_value").attr("disabled", disabled);
		// }
	}

	initReadOnly() {
		// if (this.getDisabled() == null) {
		// let readOnly = this.getReadOnly();
		//     $("#" + this.componentId).attr("disabled", readOnly);

		//     if (readOnly) {
		//         if (Util.parseBool(this.props.valueToCode)) {
		//             $("#" + this.componentId + "_value").attr("disabled", "disabled");
		//         } else {
		//             $("#" + this.componentId + "_value").removeAttr("disabled");
		//         }
		//     }else{
		//         $("#" + this.componentId + "_value").attr("disabled", readOnly);
		//     }
		// }

	}

	initValue() {
		if (this.props.model && this.props.property) {
			if ($("#" + this.componentId + "_code_").val() != this.props.model[this.props.property]) {

				let codeTable = this.codeTable;
				if (codeTable) {
					let codeTableMap = codeTable.getMap();
					let key = this.props.model[this.props.property]
					let value = (codeTableMap[key] != undefined) ? codeTableMap[key][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]] : null;

					$("#" + this.componentId + "_code_").val(key);
					$("#" + this.componentId + "_value").val(value);

					if (this.props.propertyText) {
						this.props.model[this.props.propertyText] = value
					}
				}
			}
		}
	}

	onShowSearchCodeTableDialog(event) {

		if (this.getDisabled()) {
			return
		}
		// event.preventDefault();
		if (this.state.dialogShowing) {
			return;
		}
		// if (this.getDisabled() == "disabled") {
		//     return;
		// }
		this.state.dialogShowing = true
		// if(this.getDataTableData(event)){
		// UIDialog.show(this.componentId + "_SearchCodeTableDialog");
		// }
		this.getDataTableData(event)
		UIDialog.show(this.componentId + "_SearchCodeTableDialog");
	}

	onSubmitCodeTable(event) {
		let selectedData = UIDataTable.getSelectedRecord(this.componentId + "_SearchCodeTableDataTable");
		if (selectedData.length == 0) {

			this.state.dialogShowing = false
			UIMessageHelper.error(r18n.error, "", UIMessageHelper.POSITION_TOP_RIGHT);
		} else {
			let autoHidden = true;
			if (this.props.inContainer) {
				autoHidden = !this.parseBool(this.props.inContainer);
			}
			UIDialog.hide(this.componentId + "_SearchCodeTableDialog", autoHidden);

			this.state.dialogShowing = false
			let key;
			if (this.dataSource && this.dataSource.key) {
				key = this.dataSource.key;
			} else {
				key = "id";
			}
			let codeTable = this.codeTable.getMap();
			let keyValue = selectedData["0"][key]
			let keyText = codeTable[selectedData["0"][key]][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]]
			$("#" + this.componentId + "_code_").val(keyValue);
			$("#" + this.componentId + "_value").val(keyText);




			this.props.value = keyValue

			$("#" + this.componentId).val(keyValue);
			// this.setComponentValue(keyValue)


			if (this.props.model && this.props.property) {
				this.props.model[this.props.property] = keyValue
			}
			if (this.props.model && this.props.propertyText) {
				this.props.model[this.props.propertyText] = keyText
			}

			// call onchange event
			if (this.props.onTwoTextChange) {

				this.props.onTwoTextChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
			} else if (this.props.onChange) {
				this.props.onChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
			}
		}
	}

	onCloseCodeTableDialog() {
		this.state.dialogShowing = false
		let keyCode = $("#" + this.componentId + "_code_").val()
		if (keyCode != "") {
			let codeTable = this.codeTable.getMap();
			let keyText = codeTable[keyCode][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]]
			$("#" + this.componentId + "_value").val(keyText);
			// this.setComponentValue(keyCode)
		}
	}

	onCancelCodeTableDialog() {
		let autoHidden = true;
		if (this.props.inContainer) {
			autoHidden = !this.parseBool(this.props.inContainer);
		}
		UIDialog.hide(this.componentId + "_SearchCodeTableDialog", autoHidden);
		this.state.dialogShowing = false
		let keyCode = $("#" + this.componentId + "_code_").val()
		if (keyCode != "") {
			let codeTable = this.codeTable.getMap();
			let keyText = codeTable[keyCode][config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"]]
			$("#" + this.componentId + "_value").val(keyText);
			// this.setComponentValue(keyCode)
		}
	}

	findCodeByInputText(inputValue) {
		let { codeKey, textKey } = this.props;
		let codeResult = this.codeTable.codes.filter(function (ele, index, ar) {
			if (ele[textKey].toLowerCase() == inputValue.toLowerCase()) {
				return true;
			} else {
				return false;
			}
		});
		if (codeResult.length == 1) {
			let keyValue = codeResult[0][codeKey]
			let keyText = codeResult[0][textKey]
			$("#" + this.componentId + "_code_").val(keyValue);
			$("#" + this.componentId + "_value").val(keyText);

			this.props.value = keyValue;


			if (this.props.model && this.props.property) {
				this.props.model[this.props.property] = keyValue
			}
			if (this.props.model && this.props.propertyText) {
				this.props.model[this.props.propertyText] = keyText
			}

			// this.setComponentValue(keyValue)
			this.clearValidationInfo(this.props)


			$("#" + this.componentId).val($("#" + this.componentId + "_value").val());

			if (this.props.onTwoTextChange) {
				this.props.onTwoTextChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
			} else if (this.props.onChange) {
				this.props.onChange(new OnChangeEvent(this, event, Param.getParameter(this), keyValue), keyText);
			}

		} else if (codeResult.length > 1) {
			this.state.filterTable = codeResult;
			// UIDialog.show(this.componentId + "_SearchCodeTableDialog");
			this.onShowSearchCodeTableDialog();
		} else {

			this.state.filterTable = []
			this.onShowSearchCodeTableDialog();
			//是否需要加入清除的代码
		}
	}

};

/**
 * TwoText component prop types
 */
TwoText.propTypes = $.extend({}, KeyValue.propTypes, {
	hiddenCode: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	searchable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	searchDialog: PropTypes.object,
	footerDirection: PropTypes.string,
	inContainer: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	valueToCode: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	codeKey: PropTypes.string,
	textKey: PropTypes.string,
	onTwoTextChange: PropTypes.func,
	propertyText: PropTypes.string,
	valueBlurMatchLength: PropTypes.number,
	onBlurEnable: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
});

/**
 * Get TextText component default props
 */
TwoText.defaultProps = $.extend({}, KeyValue.defaultProps, {
	hiddenCode: false,
	searchable: true,
	footerDirection: "center",
	inContainer: false,
	valueToCode: false,
	codeKey: "id",
	textKey: "text",
	valueBlurMatchLength: 0,
	onBlurEnable: true
});

