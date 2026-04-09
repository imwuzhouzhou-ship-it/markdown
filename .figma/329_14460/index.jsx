import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.a16PxMarkdown2}>
      <div className={styles.tableInner}>
        <div className={styles.cell}>
          <p className={styles.text}>表格</p>
          <div className={styles.instance}>
            <img src="../image/mnehcli3-dzv7sxh.svg" className={styles.frame} />
          </div>
        </div>
        <div className={styles.headerRow}>
          <p className={styles.text2}>分类</p>
          <p className={styles.text3}>核心功能</p>
          <p className={styles.text4}>说明</p>
        </div>
        <div className={styles.row}>
          <p className={styles.text5}>计费方式</p>
          <p className={styles.text6}>按量计费、包年包月、抢占式实例等</p>
          <div className={styles.cell2}>
            <p className={styles.text7}>提供灵活的计费模式以适应不同业务场景</p>
            <div className={styles.a16PxMarkdown}>
              <p className={styles.number}>1</p>
            </div>
            <p className={styles.a}>。</p>
          </div>
        </div>
        <div className={styles.row2}>
          <p className={styles.text5}>实例与镜像</p>
          <p className={styles.text6}>实例、镜像、高性能计算集群</p>
          <div className={styles.cell3}>
            <p className={styles.a}>实例即虚拟机,镜像是包含操作系统和应用的模板</p>
            <div className={styles.a16PxMarkdown}>
              <p className={styles.number}>1</p>
            </div>
            <p className={styles.a}>。</p>
          </div>
        </div>
        <div className={styles.row3}>
          <p className={styles.text5}>存储</p>
          <p className={styles.text6}>云盘、快照</p>
          <div className={styles.cell4}>
            <p className={styles.a}>云盘提供高可用的块存储,快照用于数据备份</p>
            <div className={styles.a16PxMarkdown}>
              <p className={styles.number}>1</p>
            </div>
            <p className={styles.a}>。</p>
          </div>
        </div>
        <div className={styles.row3}>
          <p className={styles.text5}>网络与安全</p>
          <p className={styles.text6}>私有网络、安全组、公网IP、密钥对</p>
          <div className={styles.cell4}>
            <p className={styles.a}>构建隔离的网络环境并控制访问安全</p>
            <div className={styles.a16PxMarkdown}>
              <p className={styles.number}>1</p>
            </div>
            <p className={styles.a}>。</p>
          </div>
        </div>
        <div className={styles.row3}>
          <p className={styles.text5}>弹性与部署</p>
          <p className={styles.text6}>实例启动模板、部署集</p>
          <div className={styles.cell4}>
            <p className={styles.a}>支持快速部署实例和实现底层硬件容灾</p>
            <div className={styles.a16PxMarkdown}>
              <p className={styles.number}>1</p>
            </div>
            <p className={styles.a}>。</p>
          </div>
        </div>
        <div className={styles.row3}>
          <p className={styles.text5}>账户与资源管理</p>
          <p className={styles.text6}>访问控制(IAM)、标签、项目</p>
          <div className={styles.cell4}>
            <p className={styles.a}>实现资源的分权管理和分类</p>
            <div className={styles.a16PxMarkdown}>
              <p className={styles.number}>1</p>
            </div>
            <p className={styles.a}>。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
