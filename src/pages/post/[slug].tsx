/* eslint-disable no-return-assign */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';

import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const allWords = post.data.content.reduce(
    (acc, prox) =>
      acc +
      prox.heading.split(' ').length +
      prox.body.reduce((acc2, prox2) => acc2 + prox2.text.split(' ').length, 0),
    0
  );

  return (
    <>
      <Head>
        <title>Spacetraveling | {post.data.title}</title>
      </Head>

      <Header className="post" />

      <img
        src={post.data.banner.url}
        alt="Banner do post"
        className={styles.img}
      />
      <main className={styles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={commonStyles.description}>
          <span>
            <FiCalendar />
            <p>
              {format(new Date(post.first_publication_date), 'd MMM y', {
                locale: ptBR,
              })}
            </p>
          </span>
          <span>
            <FiUser />
            <p>{post.data.author}</p>
          </span>
          <span>
            <FiClock />
            <p>{Math.ceil(allWords / 200)} min</p>
          </span>
        </section>
        <div className={styles.body}>
          {post.data.content.map((content, id) => (
            <article key={id} className={styles.content}>
              <h2>{content.heading}</h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 2 }
  );

  const params = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: [...params],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', slug?.toString(), {});
  console.log(JSON.stringify(response, null, 2));

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
