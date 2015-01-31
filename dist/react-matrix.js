var ____Class0=React.Component;for(var ____Class0____Key in ____Class0){if(____Class0.hasOwnProperty(____Class0____Key)){MatrixCell[____Class0____Key]=____Class0[____Class0____Key];}}var ____SuperProtoOf____Class0=____Class0===null?null:____Class0.prototype;MatrixCell.prototype=Object.create(____SuperProtoOf____Class0);MatrixCell.prototype.constructor=MatrixCell;MatrixCell.__superConstructor__=____Class0;
	function MatrixCell(props) {"use strict";
		____Class0.call(this,props);

		this.state = {
			value: this.props.value,
		}
		
		this.activeStyle = {
			border: '1px solid #000',
			display: 'block',
			margin: '2px 0',
			width: '40px'
		}

		this.defaultStyle = {
			border: '1px solid #eee',
			display: 'block',
			margin: '2px 0',
			width: '40px'
		}
	}

	MatrixCell.prototype.onChange=function(e) {"use strict";
		var val = e.target.value;
		this.props.matrix.setCellValue(this.props.x, this.props.y, val);
		this.setState({value: val});
	};

	MatrixCell.prototype.onClick=function(e) {"use strict";
		this.props.matrix.setCell(e.target.selectionStart, this.props.x, this.props.y)
	};

	MatrixCell.prototype.onKeyDown=function(e) {"use strict";
		var dy = 0;
		var dx = 0;
		switch(e.key) {
			case "ArrowUp":
				dy = -1;
				break;
			case "ArrowRight":
				dx = 1;
				break;
			case "ArrowDown":
				dy = 1;
				break;
			case "ArrowLeft":
				dx = -1;
				break;
		}

		this.props.matrix.moveCell(dx, dy);
	};

	MatrixCell.prototype.focus=function() {"use strict";
		var node = this.refs.input.getDOMNode();
		var caretPos = this.props.matrix.state.caret;
		node.focus();
		setTimeout(function() {
			node.setSelectionRange(caretPos, caretPos)
		}, 0);
	};

	MatrixCell.prototype.componentDidMount=function() {"use strict";
		if(this.props.active) this.focus()		
	};

	MatrixCell.prototype.componentDidUpdate=function() {"use strict";
		if(this.props.active) this.focus()
	};

	MatrixCell.prototype.render=function() {"use strict";
		var style = this.defaultStyle;
		if(this.props.active) style = this.activeStyle;
		return (
			React.createElement("input", {ref: "input", type: "text", style: style, value: this.state.value, 
				onClick: this.onClick.bind(this), 
				onKeyDown: this.onKeyDown.bind(this), 
				onChange: this.onChange.bind(this)})	
		);
	};


var ____Class1=React.Component;for(var ____Class1____Key in ____Class1){if(____Class1.hasOwnProperty(____Class1____Key)){Matrix[____Class1____Key]=____Class1[____Class1____Key];}}var ____SuperProtoOf____Class1=____Class1===null?null:____Class1.prototype;Matrix.prototype=Object.create(____SuperProtoOf____Class1);Matrix.prototype.constructor=Matrix;Matrix.__superConstructor__=____Class1;
	function Matrix(props) {"use strict";
		____Class1.call(this,props);

		this.state = {
			x: -1,
			y: -1,
			caret: 0,
			columns: this.props.columns
		}

		this.style = {
			overflow: 'hidden',
			display: 'inline-block',
			borderLeft: '2px solid #333',
			borderRight: '2px solid #333',
			borderRadius: '4px'
		}
	}

	Matrix.prototype.getHeight=function() {"use strict";
		return this.state.columns[0].length;
	};

	Matrix.prototype.getWidth=function() {"use strict";
		return this.state.columns.length;
	};

	Matrix.prototype.getCellValue=function(x, y) {"use strict";
		if(x < 0 || y < 0 || x > this.getWidth()-1 || y > this.getHeight()-1) return '';
		return this.state.columns[x][y];
	};

	Matrix.prototype.setCellValue=function(x, y, val) {"use strict";
		var columns = this.state.columns;
		columns[x][y] = val;
		this.setState({
			columns: columns,
		})
	};

	Matrix.prototype.setCell=function(caret, cellX, cellY) {"use strict";
		// Remove columns / rows if needed
		this.truncate(cellX, cellY);

		this.setState({
			caret: caret,
			x: cellX,
			y: cellY,
		});
	};

	Matrix.prototype.moveCell=function(dx, dy) {"use strict";
		var cellX = this.state.x;
		var caretPos;
		if(this.state.caret+dx > (''+this.getCellValue(cellX, this.state.y)).length) {
			cellX++;
			caretPos = 0; // First pos in next cell
		} else if(this.state.caret+dx < 0) {
			cellX--;
			caretPos = (''+this.getCellValue(cellX, this.state.y)).length;
		} else {
			caretPos = this.state.caret+dx;
		}
		var cellY = this.state.y+dy;

		// Negative position is not allowed
		if(cellX < 0) return;
		if(cellY < 0) return;

		// Remove columns / rows if needed
		this.truncate(cellX, cellY);

		// Add column / row if needed
		if(this.state.x+dx >= this.getWidth()) {
			this.addColumn();
		}
		if(this.state.y+dy >= this.getHeight()) {
			this.addRow();
		}

		this.setState({
			caret: caretPos,
			x: cellX,
			y: cellY
		})
	};

	Matrix.prototype.addRow=function() {"use strict";
		var columns = this.state.columns;
		for (var i = 0; i < columns.length; i++) {
			columns[i].push('');
		};
		this.setState({
			height: this.getHeight() + 1,
			columns: columns
		});
	};

	Matrix.prototype.addColumn=function() {"use strict";
		var columns = this.state.columns;
		var newColumn = new Array(this.getHeight());
		for (var i = 0; i < newColumn.length; i++) {
			newColumn[i] = ''
		};
		columns.push(newColumn);

		this.setState({
			width: this.state.width + 1,
			columns: columns
		})
	};

	Matrix.prototype.isRowEmpty=function(row) {"use strict";
		for (var i = 0; i < this.state.columns.length; i++) {
			var col = this.state.columns[i];
			if((''+col[col.length-1]).length > 0) {
				return false;
			}
		};

		return true;
	};

	Matrix.prototype.isColumnEmpty=function(col) {"use strict";
		var column = this.state.columns[col];
		for (var i = 0; i < column.length; i++) {
			if((''+column[i]).length > 0) return false;
		};

		return true;
	};

	Matrix.prototype.removeRow=function(row) {"use strict";
		for (var i = 0; i < this.state.columns.length; i++) {
			this.state.columns[i].splice(row, 1)
		};
		this.setState({
			columns: this.state.columns
		})
	};

	Matrix.prototype.removeColumn=function(col) {"use strict";
		this.state.columns.splice(col, 1);
		this.setState({
			columns: this.state.columns
		});
	};

	Matrix.prototype.truncate=function(cellX, cellY) {"use strict";
		for (var x = this.getWidth()-1; x > cellX; x--) {
			if(this.isColumnEmpty(x)) this.removeColumn(x)
		};
		for (var y = this.getHeight()-1; y > cellY; y--) {
			if(this.isRowEmpty(y)) this.removeRow(y)
		};
	};

	Matrix.prototype.render=function() {"use strict";
		var activeCell = this.state.x * this.getHeight() + this.state.y;
		var currentCell = 0;
		var currentCol = 0;

		var x = 0;
		var columns = this.state.columns.map(function(columnValues) {
			var y = 0;
			var column = columnValues.map(function(value) {
				var active = currentCell === activeCell;
				var cell = React.createElement(MatrixCell, {key: x+'-'+y, value: value, matrix: this, x: x, y: y, active: active})
				currentCell++;
				y += 1;
				return cell;
			}, this)
			x += 1

			var columnStyle = {
				float: 'left',
				padding: '3px'
			}

			var col = React.createElement("div", {key: x, style: columnStyle}, column)
			currentCol++;
			return col;
			
		}, this)
		return (
			React.createElement("div", {style: this.style}, 
				columns
			)
		);
	};
