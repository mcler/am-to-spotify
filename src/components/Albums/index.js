import { Fragment } from "react";
import { pure } from 'recompose';

import { FixedSizeGrid as Grid } from "react-window";

import AutoSizer from "components/AutoSizer"
import Album from 'components/Album';
import Button from 'components/Button';
import Empty from 'components/Empty';

import styles from './Albums.module.css';

const CONSTRAINTS = [
    320,
    600,
    801,
    900,
    1000,
    1300,
    1400,
    1700,
    1900,
]

function getSetup(width) {
    let columnCount = CONSTRAINTS.findIndex(constraint => width < constraint);
    if (columnCount < 0) {
        columnCount = CONSTRAINTS.length;
    }
    columnCount += 1;
    const columnWidth = Math.floor(width / columnCount) || 1;
    return { columnCount, columnWidth }
}

function Albums({ albums, className, dispatch, selected }) {
    if (!albums || !albums.length) return (
        <Empty>No albums in library</Empty>
    )

    return (
        <AutoSizer key="autosizer" className={`${className} ${styles.root}`.trim()}>
            {({ height, width }) => {
                const { columnCount, columnWidth } = getSetup(width - 12);
                const rowHeight = columnWidth + 40;
                let rowCount = Math.ceil(albums.length / columnCount);
                const itemData = { albums, columnCount, dispatch, selected };
                const selectedAll = selected.length === albums.length;

                return (
                    <Fragment>
                        <Button
                            active={selectedAll}
                            key='albums-button'
                            className={styles.selectAll}
                            onClick={() => dispatch('selectedAlbums/set', selectedAll ? [] : albums.map(album => album.id))}>
                            <input type="checkbox" name="select-albums" checked={selectedAll} readOnly={true} /> Select all
                        </Button>
                        <Grid
                            key='albums-grid'
                            className={styles.grid}
                            cellRenderer={Album}
                            columnCount={columnCount}
                            rowCount={rowCount}
                            columnWidth={columnWidth}
                            rowHeight={rowHeight}
                            height={height}
                            width={width}
                            overscanRowCount={2}
                            itemData={itemData}
                        >
                            {Album}
                        </Grid>
                    </Fragment>
                )
            }
        }
        </AutoSizer>
    )
}

export default pure(Albums);
