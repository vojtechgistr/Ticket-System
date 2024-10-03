import React, {JSX, useEffect, useMemo, useState} from "react";
import LoadingCircle from "../../common/components/loadingCircle";
import './paginator.css';
import {BiLeftArrow, BiRightArrow} from "react-icons/bi";

type arrowState = {
    canUseLeft: boolean,
    canUseRight: boolean,
}

type paginatorProps<T> = {
    ItemElement: ({data}: { data: T }) => React.ReactNode,
    items: T[],
    maxItemsPerPage: number
}
export default function usePaginator<T>(props: paginatorProps<T>)
    : JSX.Element | JSX.Element[] {
    const [arrowState, setArrowState] = useState<arrowState>({
        canUseLeft: false,
        canUseRight: false,
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const maxPages = useMemo((): number => Math.ceil((props.items?.length ?? 0) / props.maxItemsPerPage), [props.items]);

    const handleArrowClick = (direction: "left" | "right") => {
        if (!props.items) {
            return;
        }

        if (direction == "left"
            && arrowState.canUseLeft
            && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else if (direction == "right"
            && arrowState.canUseRight
            && currentPage < maxPages) {
            setCurrentPage(prev => prev + 1);
        }
    }

    useEffect(() => {
        setArrowState({
            canUseLeft: false,
            canUseRight: maxPages > 1
        })
    }, []);

    useEffect(() => {
        setArrowState({canUseLeft: currentPage > 1, canUseRight: currentPage !== maxPages})
    }, [currentPage, props.items, props.items]);

    return (
        <>
            {!props.items ? <LoadingCircle scale={4}/>
                :
                <>
                    <div className={`left-arrow ${arrowState.canUseLeft ? '' : 'disabled'}`}
                         onClick={() => handleArrowClick("left")}>
                        <BiLeftArrow/>
                    </div>

                    {/* USER LIST TABLE */}
                    <div id="paginator">

                        <div className="wrapper">
                            {Paginator(props.items, currentPage, props.maxItemsPerPage).data.map((item, key) => {
                                return <props.ItemElement key={key} data={item}/>
                            })}
                        </div>
                    </div>

                    {/* RIGHT ARROW */}
                    <div className={`right-arrow ${arrowState.canUseRight ? '' : 'disabled'}`}
                         onClick={() => handleArrowClick("right")}>
                        <BiRightArrow/>
                    </div>
                </>
            }
        </>
    );
}

export function Paginator<T>(items: T[], page: number, per_page: number) {
    page = page || 1;
    per_page = per_page || 10;
    let offset = (page - 1) * per_page;
    let paginatedItems = items.slice(offset).slice(0, per_page);
    let total_pages = Math.ceil(items.length / per_page);

    return {
        page: page,
        per_page: per_page,
        pre_page: page - 1 ? page - 1 : null,
        next_page: (total_pages > page) ? page + 1 : null,
        total: items.length,
        total_pages: total_pages,
        data: paginatedItems
    };
}