import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { colors } from '@/constants/theme'
import { router } from 'expo-router'
import { CaretLeftIcon } from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';

const BackButton = ({
    style,
    iconSize = 26,
    color = colors.white,
}) => {
    return (
        <TouchableOpacity onPress={() => router.back()} style={[styles.button, style]} >
            <CaretLeftIcon size={verticalScale(iconSize)} color={color} weight='bold' />
        </TouchableOpacity>
    )
}

export default BackButton

const styles = StyleSheet.create({
    button: {

    }
})