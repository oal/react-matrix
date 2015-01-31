/**
 * @author Olav Lindekleiv http://lindekleiv.com/
 */

class MatrixCell extends React.Component {
	constructor(props) {
		super(props);
		
		this.activeStyle = {
			border: '1px solid #000',
			display: 'block',
			margin: '4px 0',
			padding: '4px',
			width: '30px',
			textAlign: 'center'
		}

		this.defaultStyle = {
			border: '1px solid #eee',
			display: 'block',
			margin: '4px 0',
			padding: '4px',
			width: '30px',
			textAlign: 'center'
		}
	}

	onChange(e) {
		var oldVal = this.props.value;
		var val = e.target.value;
		var diffLen = (''+val).length - (''+oldVal).length;
		this.props.matrix.setCellValue(this.props.x, this.props.y, val);
		this.setState({value: val});
		this.props.matrix.moveCell(diffLen, 0)
	}

	onClick(e) {
		this.props.matrix.setCell(e.target.selectionStart, this.props.x, this.props.y)
	}

	onKeyUp(e) {
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
	}

	focus() {
		var node = this.refs.input.getDOMNode();
		node.focus();
		var caretPos = this.props.matrix.state.caret;
		node.setSelectionRange(caretPos, caretPos)
	}

	componentDidMount() {
		if(this.props.active) this.focus()		
	}

	componentDidUpdate() {
		if(this.props.active) this.focus()
	}

	render() {
		var style = this.defaultStyle;
		if(this.props.active) style = this.activeStyle;
		return (
			<input ref="input" type="text" style={style} value={this.props.value} readOnly={this.props.readonly}
				onClick={this.onClick.bind(this)}
				onKeyUp={this.onKeyUp.bind(this)}
				onChange={this.onChange.bind(this)} />	
		);
	}
}

class Matrix extends React.Component {
	constructor(props) {
		super(props);

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
			padding: '0 2px',
			borderRadius: '4px'
		}
	}

	getHeight() {
		return this.state.columns[0].length;
	}

	getWidth() {
		return this.state.columns.length;
	}

	getCellValue(x, y) {
		if(x < 0 || y < 0 || x > this.getWidth()-1 || y > this.getHeight()-1) return '';
		return this.state.columns[x][y];
	}

	setCellValue(x, y, val) {
		var columns = this.state.columns;
		columns[x][y] = val;
		this.setState({
			columns: columns,
		})
	}

	getColumn(n) {
		return this.state.columns[n];
	}

	setColumn(n, values) {
		var columns = this.state.columns;
		columns[n] = values;
		this.setState({columns: columns});
	}

	getColumns() {
		return this.state.columns;
	}

	getRow(n) {
		var row = new Array(this.getWidth());
		var columns = this.state.columns;
		for (var i = 0; i < columns.length; i++) {
			row[i] = columns[i][n];
		}

		return row;
	}

	setRow(n, values) {
		var columns = this.state.columns
		for (var i = 0; i < values.length; i++) {
			columns[i][n] = values[i];
		}

		this.setState({columns: columns});
	}

	getRows() {
		var rows = new Array(this.getHeight());
		for (var i = 0; i < this.getHeight(); i++) {
			rows[i] = this.getRow(i)
		};

		return rows;
	}

	isResizeableX() {
		var resize = this.props.resize;
		return (!this.props.readonly && (resize === 'horizontal' || resize === 'both' || resize === undefined))
	}

	isResizeableY() {
		var resize = this.props.resize;
		return (!this.props.readonly && (resize === 'vertical' || resize === 'both' || resize === undefined))
	}

	setCell(caret, cellX, cellY) {
		// Remove columns / rows if needed
		this.truncate(cellX, cellY);

		this.setState({
			caret: caret,
			x: cellX,
			y: cellY,
		});
	}

	moveCell(dx, dy) {
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

		// If outside bounds and resizing is disabled
		if(!this.isResizeableX() && cellX >= this.getWidth()) cellX = this.state.x;
		if(!this.isResizeableY() && cellY >= this.getHeight()) cellY = this.state.y;

		// Remove columns / rows if needed
		this.truncate(cellX, cellY);

		// Add column / row if needed
		if(cellX >= this.getWidth() && this.isResizeableX()) {
			this.addColumn();
		}
		if(this.state.y+dy >= this.getHeight() && this.isResizeableY()) {
			this.addRow();
		}

		this.setState({
			caret: caretPos,
			x: cellX,
			y: cellY
		})
	}

	addRow() {
		var columns = this.state.columns;
		for (var i = 0; i < columns.length; i++) {
			columns[i].push('');
		};
		this.setState({
			height: this.getHeight() + 1,
			columns: columns
		});
	}

	addColumn() {
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
	}

	isRowEmpty(row) {
		for (var i = 0; i < this.state.columns.length; i++) {
			var col = this.state.columns[i];
			if((''+col[col.length-1]).length > 0) {
				return false;
			}
		};

		return true;
	}

	isColumnEmpty(col) {
		var column = this.state.columns[col];
		for (var i = 0; i < column.length; i++) {
			if((''+column[i]).length > 0) return false;
		};

		return true;
	}

	removeRow(row) {
		for (var i = 0; i < this.state.columns.length; i++) {
			this.state.columns[i].splice(row, 1)
		};
		this.setState({
			columns: this.state.columns
		})
	}

	removeColumn(col) {
		this.state.columns.splice(col, 1);
		this.setState({
			columns: this.state.columns
		});
	}

	truncate(cellX, cellY) {
		for (var x = this.getWidth()-1; x > cellX; x--) {
			if(this.isColumnEmpty(x) && this.isResizeableX()) this.removeColumn(x)
		};
		for (var y = this.getHeight()-1; y > cellY; y--) {
			if(this.isRowEmpty(y) && this.isResizeableY()) this.removeRow(y)
		};
	}

	render() {
		var activeCell = this.state.x * this.getHeight() + this.state.y;
		var currentCell = 0;

		var columns = this.state.columns.map(function(columnValues, x) {
			var y = 0;
			var column = columnValues.map(function(value, y) {
				var active = currentCell === activeCell;
				var cell = <MatrixCell key={x+'-'+y} value={value} matrix={this} x={x} y={y} active={active} readonly={this.props.readonly} />
				currentCell++;
				return cell;
			}, this)

			var columnStyle = {
				float: 'left',
				padding: '2px'
			}

			var col = <div key={x} style={columnStyle}>{column}</div>
			return col;
			
		}, this)
		return (
			<div style={this.style}>
				{columns}
			</div>
		);
	}
}

Matrix.propTypes = {
	columns: React.PropTypes.array,
	resize: React.PropTypes.oneOf(['both', 'vertical', 'horizontal', 'none']),
	readonly: React.PropTypes.bool
}