const { prisma } = require('../prisma/prisma-client');
const brypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const path = require('path');
const app = express();
/**
 * @route GET /api/cart
 * @desс Товары из корзины
 * @access Public
 */
const getAll = async (req, res) => {
    try {
        // Извлекаем токен из заголовка
        const token = req.headers.authorization?.split(' ')[1]; // Предполагаем формат "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        // Проверяем токен и извлекаем информацию о пользователе
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Убедитесь, что у вас есть секретный ключ

        const cartItems = await prisma.cart.findMany({
            where: { userId: decoded.id },
            include: {
                product: true
            }
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(200).json([]);
        }

        const products = cartItems.map(item => ({
            ...item.product,
            count: item.count,
            cartId: item.id,
            imageUrl: `http://localhost:8000/uploads/${item.product.filename}`
        }));

        //const sortedProducts = products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        res.status(200).json(products);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
}
/**
 *
 * @route POST /api/cart/add
 * @desc Добавление товара в корзину
 * @access Public
 */
const addCart = async (req, res) => {
    const { productId, count } = req.body; // Извлекаем productId и count из тела запроса

    // Проверяем, что productId и count предоставлены
    if (!productId || !count) {
        return res.status(400).json({ message: 'Необходимы productId и count' });
    }

    try {
        // Извлекаем токен из заголовка
        const token = req.headers.authorization?.split(' ')[1]; // Предполагаем формат "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        // Проверяем токен и извлекаем информацию о пользователе
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Убедитесь, что у вас есть секретный ключ

        // Проверяем, есть ли уже товар в корзине
        const existingCartItem = await prisma.cart.findFirst({
            where: {
                userId: decoded.id,
                productID: productId,
            },
        });

        if (existingCartItem) {
            // Если товар уже есть в корзине, обновляем количество
            const updatedCartItem = await prisma.cart.update({
                where: { id: existingCartItem.id },
                data: { count: (parseInt(existingCartItem.count) + parseInt(count)).toString() }, // Обновляем количество
            });
            return res.status(200).json(updatedCartItem);
        } else {
            // Если товара нет в корзине, создаем новый элемент
            const newCartItem = await prisma.cart.create({
                data: {
                    productID: productId,
                    count: count.toString(),
                    userId: decoded.id,
                },
            });
            return res.status(201).json(newCartItem);
        }
    } catch (error) {
        console.error(error); // Логируем ошибку для отладки
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
};
/**
 * @route POST /api/cart/:id
 * @desс Удаление из корзины по id
 * @access Public
 */
const removeOneCart = async (req, res) => {
    const { id } = req.params;

    try {
        const cartItem = await prisma.cart.findUnique({
            where: { id }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        await prisma.cart.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Товар удалён' });
    } catch (error) {
        console.error(error); // Логируем ошибку для отладки
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
}
/**
 * @route DELETE /api/cart
 * @description Удаление всех товаров из корзины для текущего пользователя
 * @access Public
 */
const removeAllFromCart = async (req, res) => {
    try {
        // Извлекаем токен из заголовка
        const token = req.headers.authorization?.split(' ')[1]; // Предполагаем формат "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Токен не предоставлен' });
        }

        // Проверяем токен и извлекаем информацию о пользователе
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Убедитесь, что у вас есть секретный ключ

        // Удаляем все товары из корзины для текущего пользователя
        await prisma.cart.deleteMany({
            where: { userId: decoded.id }
        });

        res.status(200).json({ message: 'Все товары удалены из корзины' });
    } catch (error) {
        console.error(error); // Логируем ошибку для отладки
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
};
module.exports = {
    getAll,
    addCart,
    removeOneCart
}