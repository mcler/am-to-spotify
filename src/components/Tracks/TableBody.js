import { pure } from "recompose";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "components/AutoSizer"
import TableRow from './TableRow';

import styles from './Table.module.css';

const ROW_HEIGHT = 24;

function Table({ dispatch, tracks, selected }) {
    const itemData = { dispatch, selected, tracks };

    return (
        <AutoSizer key="autosizer-table-body" className={styles.table__body}>
            {({height, width}) => (
                <List
                    key="table-list"
                    height={height}
                    width={width}
                    overscanCount={Math.ceil(window.innerHeight / 2 / ROW_HEIGHT) || 1}
                    itemData={itemData}
                    itemCount={tracks.length}
                    itemSize={ROW_HEIGHT}
                >
                    {TableRow}
                </List>
            )}
        </AutoSizer>
    )
}

export default pure(Table);
