import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';

const images = [
    {
        url: '/img/cough-128.jpg',
        title: 'Bad',
    },
    {
        url: '/img/mask-nose-128.jpg',
        title: 'OK',
    },
    {
        url: '/img/mask-good128.jpg',
        title: 'Good',
    },
];

const imageSrc = {
    filter: 'grayscale(80%)',
    height: '2em',
    '&:hover, &$focusVisible': {
        filter: 'grayscale(0%)',
        zIndex: 1,
        '& $imageBackdrop': {
            opacity: 0.15,
        },
        '& $imageMarked': {
            opacity: 0,
        },
        '& $imageTitle': {
            border: '4px solid currentColor',
        },
    },
}

const useStyles = makeStyles((theme) => ({
    root: {
        // display: 'flex',
        // flexWrap: 'wrap',
        // minWidth: 300,
        // width: '100%',
    },
    image: {
        position: 'relative',
        // height: 200,
        '&:hover, &$focusVisible': {
            filter: 'grayscale(0%)',
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.15,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },
    focusVisible: {},
    imageButton: {
        // position: 'absolute',
        // left: 0,
        // right: 0,
        // top: 0,
        // bottom: 0,
        // display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    imageSelected: {
        ...imageSrc,
        transition: theme.transitions.create('height'),
        filter: 'grayscale(0%)',
        height: '3em',
    },
    imageSrc : {
        ...imageSrc,
        transition: theme.transitions.create('height'),
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0,
        transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    },
}));

export default ({current, onSelect}: {
    current: number | undefined,
    onSelect: (ix: number) => void,
}) => {
    const classes = useStyles();

    return (
        <span className={classes.root}>
            {images.map((image, i) => (
                <ButtonBase
                    focusRipple
                    onClick={_ => onSelect(i)}
                    key={i}
                    className={classes.image}
                    focusVisibleClassName={classes.focusVisible}
                    // style={{
                    //     width: "33%",
                    // }}
                >
                    <img src={image.url}
                         alt={image.title}
                         className={i === current ? classes.imageSelected : classes.imageSrc}
                    />
                    <span className={classes.imageBackdrop}/>
                    <span className={classes.imageButton}>
            {/*<Typography*/}
            {/*    component="span"*/}
            {/*    variant="subtitle1"*/}
            {/*    color="inherit"*/}
            {/*    className={classes.imageTitle}*/}
            {/*>*/}
            {/*  {image.title}*/}
            {/*    <span className={classes.imageMarked}/>*/}
            {/*</Typography>*/}
          </span>
                </ButtonBase>
            ))}
        </span>
    );
}
