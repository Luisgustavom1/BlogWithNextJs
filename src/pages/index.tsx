/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Head from 'next/head';

import { useEffect, useState } from 'react';

import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';

import { FiUser, FiCalendar } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  function getMorePosts(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        console.log(data.results);
        setPosts([...posts, ...data.results]);
      });
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <Header className="home" />

      <main className={commonStyles.main}>
        {posts?.map(post => (
          <Link href={`/post/${post.uid}`}>
            <a className={styles.post} key={post.uid}>
              <h1 className={styles.title}>{post.data.title}</h1>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <footer className={commonStyles.description}>
                <span>
                  <FiCalendar />
                  <p>{post.first_publication_date}</p>
                </span>
                <span>
                  <FiUser />
                  <p>{post.data.author}</p>
                </span>
              </footer>
            </a>
          </Link>
        ))}
        {nextPage && (
          <p className={styles.morePosts} onClick={() => getMorePosts()}>
            Carregar mais posts
          </p>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM y',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
